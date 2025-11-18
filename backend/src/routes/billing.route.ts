import { Router } from "express";

import {
  createOrderController,
  verifyOrderController,
} from "../controllers/billing.controller";

const billingRoutes = Router();

billingRoutes.post("/create-order", createOrderController);
billingRoutes.post("/verify", verifyOrderController);

export default billingRoutes;

