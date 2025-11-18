import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { complaintSchema, ComplaintType } from "../validators/complaint.validator";
import { submitComplaintService } from "../services/complaint.service";

/**
 * Controller for submitting complaints/feedback
 * Sends email to saumilmakkar@gmail.com
 */
export const submitComplaintController = asyncHandler(
  async (req: Request, res: Response) => {
    // Validate request body
    const complaintData = complaintSchema.parse(req.body);

    // Send complaint email
    await submitComplaintService(complaintData);

    return res.status(HTTPSTATUS.OK).json({
      message: "Complaint submitted successfully. We will get back to you soon.",
      data: {
        ticketNumber: `TKT-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      },
    });
  }
);

