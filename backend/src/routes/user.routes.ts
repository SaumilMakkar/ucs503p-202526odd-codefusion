import { Router } from "express";
import {
  loginController,
  RegisterController,
} from "../controllers/auth.controller";
import { getCurrentUserController } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);


export default userRoutes;