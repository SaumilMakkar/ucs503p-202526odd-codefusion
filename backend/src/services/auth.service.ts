import ReportSettingModel from "../models/report-setting-model";
import UserModel from "../models/user.models";
import { UnauthorizedException } from "../utils/app-error";
import { RegisterSchemaType } from "../validators/auth.validator";
import mongoose from "mongoose";
import { calulateNextReportDate } from "../utils/helper";

export const registerService = async (body: RegisterSchemaType) => {
    const { email } = body;
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                throw new UnauthorizedException("User already exists");
            }

            const newUser = new UserModel({
                ...body,
            });
            await newUser.save({ session });

            // Define calculateNextReportDate inline since it's missing
            

            const reportSetting = new ReportSettingModel({
                userId: newUser._id,
                frequency: "MONTHLY",
                isEnabled: true,
                lastSentDate: null,
                nextReportDate: calulateNextReportDate(),
            });
            await reportSetting.save({ session });
            return newUser;
        });
    } catch (error) {
        throw error;
    } finally {
        await session.endSession();
    }
};
    
   

    

