import { Request, Response } from "express";

import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
} from "../services/billing.service";
import {
  createOrderSchema,
  verifyOrderSchema,
} from "../validators/billing.validator";
import { UnauthorizedException } from "../utils/app-error";

export const createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const { planId } = createOrderSchema.parse(req.body);

    const user = req.user as {
      id?: string;
      _id?: string;
      name?: string;
      email?: string;
    };

    const userId = user?.id ?? user?._id;

    if (!userId) {
      throw new UnauthorizedException("Authenticated user not found on request.");
    }

    const { order, plan, billingOrder } = await createRazorpayOrderService({
      planId,
      userId,
      customerEmail: user?.email,
      customerName: user?.name,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Razorpay order created successfully",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        amount_due: order.amount_due,
        amount_paid: order.amount_paid,
        created_at: order.created_at,
        status: order.status,
        billingOrderId: billingOrder.id,
      },
      plan: {
        id: plan.id,
        name: plan.name,
        amountInPaise: plan.amountInPaise,
        interval: plan.interval,
        description: plan.description,
      },
      customer: {
        name: user?.name ?? "",
        email: user?.email ?? "",
      },
      billingOrder: {
        id: billingOrder.id,
        status: billingOrder.status,
      },
    });
  }
);

export const verifyOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verifyOrderSchema.parse(req.body);

    const user = req.user as {
      id?: string;
      _id?: string;
    };

    const userId = user?.id ?? user?._id;

    if (!userId) {
      throw new UnauthorizedException("Authenticated user not found on request.");
    }

    const billingOrder = await verifyRazorpayPaymentService({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Payment verified successfully",
      order: {
        id: billingOrder.razorpayOrderId,
        status: billingOrder.status,
        paidAt: billingOrder.paidAt,
        razorpayPaymentId: billingOrder.razorpayPaymentId,
      },
      plan: {
        id: billingOrder.planId,
        name: billingOrder.planName,
        interval: billingOrder.planInterval,
        amount: billingOrder.amount,
      },
    });
  }
);

