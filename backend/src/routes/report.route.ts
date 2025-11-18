import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  sendTestEmailController,
  sendTestWhatsAppController,
  updateReportSettingController,
  triggerReportGenerationController,
  sendWhatsAppReportController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.get("/send-test-email", sendTestEmailController);
reportRoutes.get("/send-test-whatsapp", sendTestWhatsAppController);
reportRoutes.post("/trigger-generation", triggerReportGenerationController);
reportRoutes.post("/send-whatsapp-report", sendWhatsAppReportController);
export default reportRoutes;