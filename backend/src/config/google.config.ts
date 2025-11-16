import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Env } from "./env.config";
import UserModel from "../models/user.models";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report-setting.model";
import { calculateNextReportDate } from "../utils/helper";

passport.use(
	new GoogleStrategy(
		{
			clientID: Env.GOOGLE_CLIENT_ID as string,
			clientSecret: Env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: Env.GOOGLE_CALLBACK_URL as string,
		},
		async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
			try {
				const email = profile.emails?.[0]?.value?.toLowerCase();
				if (!email) {
					return done(null, false, { message: "Google account does not have a verified email" });
				}

				let user = await UserModel.findOne({ email });

				if (!user) {
					user = new UserModel({
						name: profile.displayName || "Google User",
						email,
						authProvider: "google",
						providerId: profile.id,
						profilePicture: profile.photos?.[0]?.value || null,
					});
					await user.save();

					// initialize default report settings on first sign-in
					const reportSetting = new ReportSettingModel({
						userId: user._id,
						frequency: ReportFrequencyEnum.MONTHLY,
						isEnabled: true,
						nextReportDate: calculateNextReportDate(),
						lastSentDate: null,
					});
					await reportSetting.save();
				} else if (user.authProvider === "local" && !user.providerId) {
					// link google provider metadata if user previously signed up locally
					user.authProvider = "google";
					user.providerId = profile.id;
					if (!user.profilePicture && profile.photos?.[0]?.value) {
						user.profilePicture = profile.photos[0].value;
					}
					await user.save();
				}

				return done(null, user);
			} catch (error) {
				return done(error as Error, false);
			}
		}
	)
);

export default passport;


