import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/app-error";
import { z,ZodError } from "zod";
import { Response } from "express";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { MulterError } from "multer";
const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};
const handleMulterError = (error: MulterError) => {
  const messages = {
    LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
    LIMIT_FILE_SIZE: "File size exceeds the limit",
    LIMIT_FILE_COUNT: "Too many files uploaded",
    default: "File upload error",
  };

  return {
    status: HTTPSTATUS.BAD_REQUEST,
    message: messages[error.code as keyof typeof messages] || messages.default,
    error: error.message,
  };
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): any => {
  console.log("Error occurred on PATH:", req.path, "Error:", error);
  if (res.headersSent) {
    return next(error);
  }
  if(error instanceof ZodError){
    return formatZodError(res,error)
  }


  if (error instanceof MulterError) {
    const { status, message, error: err } = handleMulterError(error);
    return res.status(status).json({
      message,
      error: err,
      errorCode: ErrorCodeEnum.FILE_UPLOAD_ERROR,
    });
  }

  const isKnownAppError = error instanceof AppError;
  const inferredStatus = typeof (error as any)?.statusCode === "number" ? (error as any).statusCode : undefined;
  const statusCode = isKnownAppError ? (error as AppError).statusCode : (inferredStatus ?? HTTPSTATUS.INTERNAL_SERVER_ERROR);

  return res.status(statusCode).json({
    message: (error as any)?.message || "Internal Server Error",
    errorCode: isKnownAppError ? (error as AppError).errorCode : undefined,
  });
}