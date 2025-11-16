import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request,Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { signJwtToken } from "../utils/jwt";
import { Env } from "../config/env.config";
export const RegisterController=asyncHandler(async(req:Request,res:Response)=>
   {
    const body =registerSchema.parse(req.body)
    const result=await registerService(body)
    return res.status(HTTPSTATUS.CREATED).json({message:"User registered successfully",
        data:result
    })
})

export const loginController = asyncHandler(
    async (req: Request, res: Response) => {
      const body = loginSchema.parse({
        ...req.body,
      });
      const { user, accessToken, expiresAt, reportSetting } =
        await loginService(body);
  
      return res.status(HTTPSTATUS.OK).json({
        message: "User logged in successfully",
        user,
        accessToken,
        expiresAt,
        reportSetting,
      });
    }
  );

export const logoutController = asyncHandler(
    async (req: Request, res: Response) => {
      // In a stateless JWT system, logout is handled client-side
      // But we can still provide a success response
      return res.status(HTTPSTATUS.OK).json({
        message: "User logged out successfully",
      });
    }
  );

export const googleAuthSuccessController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) {
    return res.redirect(
      `${Env.FRONTEND_ORIGIN}/?error=${encodeURIComponent("Google authentication failed")}`
    );
  }

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  // Redirect to frontend with token and expiry; client will fetch current-user
  const redirectUrl = `${Env.FRONTEND_ORIGIN}/auth/callback?token=${encodeURIComponent(
    token
  )}&expiresAt=${encodeURIComponent(String(expiresAt))}`;

  return res.redirect(redirectUrl);
});