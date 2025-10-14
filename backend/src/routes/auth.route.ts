import {Router} from "express"
import { RegisterController,loginController,logoutController } from "../controllers/auth.controller";
const authRoutes=Router();
authRoutes.post('/register',RegisterController)
authRoutes.post('/login',loginController)
authRoutes.post('/logout',logoutController)
export default authRoutes