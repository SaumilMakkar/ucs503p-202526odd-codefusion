import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  sendTestEmailController,
  updateReportSettingController,
  triggerReportGenerationController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.get("/send-test-email", sendTestEmailController);
reportRoutes.post("/trigger-generation", triggerReportGenerationController);
export default reportRoutes;