import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  sendTestEmailController,
  updateReportSettingController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.get("/send-test-email", sendTestEmailController);
export default reportRoutes;