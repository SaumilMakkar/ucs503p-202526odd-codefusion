import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service";
import { updateReportSettingSchema } from "../validators/report.validator";
import { sendReportEmail } from "../mailers/report.mailer";

export const getAllReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const result = await getAllReportsService(userId, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  }
);

export const updateReportSettingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    console.log("updateReportSettingController called with userId:", userId);
    console.log("Request body:", req.body);
    
    const body = updateReportSettingSchema.parse(req.body);
    console.log("Parsed body:", body);

    await updateReportSettingService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports setting updated successfully",
    });
  }
);

export const generateReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to } = req.query;
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const result = await generateReportService(userId, fromDate, toDate);

    return res.status(HTTPSTATUS.OK).json({
      message: "Report generated successfully",
      ...result,
    });
  }
);
export const sendTestEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to, email } = req.query;
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const result = await generateReportService(userId, fromDate, toDate);

    if (!result) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No data found for the specified date range",
      });
    }

    try {
      await sendReportEmail({
        email: email as string || req.user?.email!,
        username: req.user?.name!,
        report: result,
        frequency: "Test",
      });

      return res.status(HTTPSTATUS.OK).json({
        message: "Test email sent successfully",
        email: email as string || req.user?.email!,
      });
    } catch (error) {
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to send email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export const triggerReportGenerationController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Manual report generation triggered");
    
    try {
      // Import the report job function
      const { processReportJob } = await import("../crons/jobs/report.job");
      
      // Run the report generation job
      await processReportJob();
      
      return res.status(HTTPSTATUS.OK).json({
        message: "Report generation job triggered successfully",
      });
    } catch (error) {
      console.error("Report generation error:", error);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to trigger report generation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);