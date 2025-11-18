import { Router } from "express";
import { submitComplaintController } from "../controllers/complaint.controller";

const complaintRoutes = Router();

// Complaint submission endpoint - public (no auth required)
complaintRoutes.post("/submit", submitComplaintController);

export default complaintRoutes;

