import UserModel from "../models/user.models";
import { NotFoundException } from "../utils/app-error";


export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId: string,
  
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

 

  await user.save();

  return user.omitPassword();
};