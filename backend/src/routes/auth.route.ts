import {Router} from "express"
import passport from "passport";
import { RegisterController,loginController,logoutController, googleAuthSuccessController } from "../controllers/auth.controller";
const authRoutes=Router();
authRoutes.post('/register',RegisterController)
authRoutes.post('/login',loginController)
authRoutes.post('/logout',logoutController)

// Google OAuth
authRoutes.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
	})
);

authRoutes.get(
	"/google/callback",
	passport.authenticate("google", { session: false, failureRedirect: "/" }),
	googleAuthSuccessController
);
export default authRoutes