import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  findByIdUserService,
  updateUserService,
} from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";


export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
   
    const userId = req.user?._id;
   

    const user = await updateUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      data: user,
    });
  }
);