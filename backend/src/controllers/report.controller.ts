// import { Request, Response } from "express";
// import { asyncHandler } from "../middlewares/asyncHandler.middleware";
// import { HTTPSTATUS } from "../config/http.config";
// import {
//   generateReportService,
//   getAllReportsService,
//   updateReportSettingService,
// } from "../services/report.service";
// import { updateReportSettingSchema } from "../validators/report.validator";
// import { sendReportEmail, sendReportWhatsApp } from "../mailers/report.mailer";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service";
import { updateReportSettingSchema } from "../validators/report.validator";
import { sendReportEmail, sendReportWhatsApp } from "../mailers/report.mailer";
import ReportModel, { ReportStatusEnum } from "../models/report.model";
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
        email: (email as string) || req.user?.email!,
        username: req.user?.name!,
        report: {
          ...result,
          summary: {
            ...result.summary,
            topCategories: result.summary.topCategories.map((cat: any) => ({
              category: cat.category,
              name: cat.name,
              amount: cat.amount,
              percent: cat.percent,
            })),
          }
        },
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


// export const getAllReportsController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?._id;

//     const pagination = {
//       pageSize: parseInt(req.query.pageSize as string) || 20,
//       pageNumber: parseInt(req.query.pageNumber as string) || 1,
//     };

//     const result = await getAllReportsService(userId, pagination);

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Reports history fetched successfully",
//       ...result,
//     });
//   }
// );

// export const updateReportSettingController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?._id;
//     console.log("updateReportSettingController called with userId:", userId);
//     console.log("Request body:", req.body);
    
//     const body = updateReportSettingSchema.parse(req.body);
//     console.log("Parsed body:", body);

//     await updateReportSettingService(userId, body);

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Reports setting updated successfully",
//     });
//   }
// );

// export const generateReportController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?._id;
//     const { from, to } = req.query;
//     const fromDate = new Date(from as string);
//     const toDate = new Date(to as string);

//     const result = await generateReportService(userId, fromDate, toDate);

//     return res.status(HTTPSTATUS.OK).json({
//       message: "Report generated successfully",
//       ...result,
//     });
//   }
// );
// export const sendTestEmailController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?._id;
//     const { from, to, email } = req.query;
//     const fromDate = new Date(from as string);
//     const toDate = new Date(to as string);

//     const result = await generateReportService(userId, fromDate, toDate);

//     if (!result) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: "No data found for the specified date range",
//       });
//     }

//     try {
//       await sendReportEmail({
//         email: (email as string) || req.user?.email!,
//         username: req.user?.name!,
//         report: {
//           ...result,
//           summary: {
//             ...result.summary,
//             topCategories: result.summary.topCategories.map((cat: any) => ({
//               category: cat.category,
//               name: cat.name,
//               amount: cat.amount,
//               percent: cat.percent,
//             })),
//           }
//         },
//         frequency: "Test",
//       });

//       return res.status(HTTPSTATUS.OK).json({
//         message: "Test email sent successfully",
//         email: email as string || req.user?.email!,
//       });
//     } catch (error) {
//       return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//         message: "Failed to send email",
//         error: error instanceof Error ? error.message : "Unknown error",
//       });
//     }
//   }
// );

// export const sendTestWhatsAppController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?._id;
//     const { from, to, phoneNumber } = req.query;
//     const fromDate = new Date(from as string);
//     const toDate = new Date(to as string);

//     const result = await generateReportService(userId, fromDate, toDate);

//     if (!result) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: "No data found for the specified date range",
//       });
//     }

//     const phone = (phoneNumber as string) || req.user?.phoneNumber;
//     if (!phone) {
//       return res.status(HTTPSTATUS.BAD_REQUEST).json({
//         message: "Phone number is required. Please provide phoneNumber in query or update your profile.",
//       });
//     }

//     // Ensure phone number has + prefix for E.164 format
//     const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

//     try {
//       await sendReportWhatsApp({
//         phoneNumber: `whatsapp:${formattedPhone}`,
//         username: req.user?.name!,
//         report: {
//           ...result,
//           summary: {
//             ...result.summary,
//             topCategories: result.summary.topCategories.map((cat: any) => ({
//               category: cat.category,
//               name: cat.name,
//               amount: cat.amount,
//               percent: cat.percent,
//             })),
//           }
//         },
//         frequency: "Test",
//       });

//       return res.status(HTTPSTATUS.OK).json({
//         message: "Test WhatsApp message sent successfully",
//         phoneNumber: phone,
//       });
//     } catch (error) {
//       return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//         message: "Failed to send WhatsApp message",
//         error: error instanceof Error ? error.message : "Unknown error",
//       });
//     }
//   }
// );

export const sendWhatsAppReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to, phoneNumber } = req.body ?? {};

    const toDate = to ? new Date(to as string) : new Date();
    const fromDate = from
      ? new Date(from as string)
      : (() => {
          const start = new Date(toDate);
          start.setDate(start.getDate() - 29);
          return start;
        })();

    const result = await generateReportService(userId, fromDate, toDate);

    if (!result) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No data found for the specified date range",
      });
    }

    const fallbackPhone = process.env.WHATSAPP_REPORT_NUMBER || "919501726922";
    const phone = (phoneNumber as string) || fallbackPhone;

    if (!phone) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Phone number is required to send the WhatsApp report.",
      });
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    try {
      await sendReportWhatsApp({
        phoneNumber: `whatsapp:${formattedPhone}`,
        username: req.user?.name || "there",
        report: {
          ...result,
          summary: {
            ...result.summary,
            topCategories: result.summary.topCategories.map((cat: any) => ({
              category: cat.category,
              name: cat.name,
              amount: cat.amount,
              percent: cat.percent,
            })),
          },
        },
        frequency: "On-demand",
      });

      await ReportModel.create({
        userId,
        period: result.period,
        sentDate: new Date(),
        status: ReportStatusEnum.SENT,
      });

      return res.status(HTTPSTATUS.OK).json({
        message: "WhatsApp report sent successfully",
        phoneNumber: formattedPhone,
      });
    } catch (error) {
      await ReportModel.create({
        userId,
        period: result.period,
        sentDate: new Date(),
        status: ReportStatusEnum.FAILED,
      });

      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to send WhatsApp report",
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

export const sendTestWhatsAppController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { from, to, phoneNumber } = req.query;
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const result = await generateReportService(userId, fromDate, toDate);

    if (!result) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No data found for the specified date range",
      });
    }

    const phone = (phoneNumber as string) || req.user?.phoneNumber;
    if (!phone) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Phone number is required. Please provide phoneNumber in query or update your profile.",
      });
    }

    // Ensure phone number has + prefix for E.164 format
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      await sendReportWhatsApp({
        phoneNumber: `whatsapp:${formattedPhone}`,
        username: req.user?.name!,
        report: {
          ...result,
          summary: {
            ...result.summary,
            topCategories: result.summary.topCategories.map((cat: any) => ({
              category: cat.category,
              name: cat.name,
              amount: cat.amount,
              percent: cat.percent,
            })),
          }
        },
        frequency: "Test",
      });

      return res.status(HTTPSTATUS.OK).json({
        message: "Test WhatsApp message sent successfully",
        phoneNumber: phone,
      });
    } catch (error) {
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to send WhatsApp message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// export const triggerReportGenerationController = asyncHandler(
//   async (req: Request, res: Response) => {
//     console.log("Manual report generation triggered");
    
//     try {
//       // Import the report job function
//       const { processReportJob } = await import("../crons/jobs/report.job");
      
//       // Run the report generation job
//       await processReportJob();
      
//       return res.status(HTTPSTATUS.OK).json({
//         message: "Report generation job triggered successfully",
//       });
//     } catch (error) {
//       console.error("Report generation error:", error);
//       return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
//         message: "Failed to trigger report generation",
//         error: error instanceof Error ? error.message : "Unknown error",
//       });
//     }
//   }
// );