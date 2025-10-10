import { Router } from "express";
import {
  loginController,
  RegisterController,
} from "../controllers/auth.controller";
import { getCurrentUserController, updateUserController } from "../controllers/user.controller";
import { upload } from "../config/cloudinary.config";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);
userRoutes.put('/update',upload.single("ProfileImage"),updateUserController)

export default userRoutes;