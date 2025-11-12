import Razorpay from "razorpay";
import mongoose from "mongoose";
import { createHmac, randomUUID } from "crypto";

import { Env } from "../config/env.config";
import BillingOrderModel from "../models/billing-order.model";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import {
  CreateOrderSchemaType,
  VerifyOrderSchemaType,
} from "../validators/billing.validator";

type PlanConfig = {
  id: string;
  name: string;
  amountInPaise: number;
  interval: "quarterly" | "annual";
  description: string;
};

const PLANS: Record<string, PlanConfig> = {
  "premium-quarterly": {
    id: "premium-quarterly",
    name: "Premium Quarterly",
    amountInPaise: 899900,
    interval: "quarterly",
    description:
      "Scale your product org with advanced workflow automation, insights, and secure collaboration.",
  },
  "premium-annual": {
    id: "premium-annual",
    name: "Premium Annual",
    amountInPaise: 2999900,
    interval: "annual",
    description:
      "Bundled launch support, dedicated onboarding, and advanced security controls.",
  },
};

const ensureRazorpayClient = () => {
  if (!Env.RAZORPAY_KEY_ID || !Env.RAZORPAY_KEY_SECRET) {
    throw new InternalServerException(
      "Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  return new Razorpay({
    key_id: Env.RAZORPAY_KEY_ID,
    key_secret: Env.RAZORPAY_KEY_SECRET,
  });
};

interface CreateOrderParams extends CreateOrderSchemaType {
  userId: string;
  customerEmail?: string | null | undefined;
  customerName?: string | null | undefined;
}

interface VerifyPaymentParams extends VerifyOrderSchemaType {
  userId: string;
}

export const createRazorpayOrderService = async ({
  planId,
  userId,
  customerEmail,
  customerName,
}: CreateOrderParams) => {
  const plan = PLANS[planId];

  if (!plan) {
    throw new BadRequestException("Selected plan is not available.");
  }

  const razorpay = ensureRazorpayClient();

  const receipt = `cf_${plan.id}_${Date.now().toString(36)}`.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: plan.amountInPaise,
    currency: "INR",
    receipt,
    notes: {
      planId: plan.id,
      planInterval: plan.interval,
      userId,
      customerEmail: customerEmail ?? "",
      customerName: customerName ?? "",
    },
  });

  const billingOrder = await BillingOrderModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    planId: plan.id,
    planName: plan.name,
    planInterval: plan.interval,
    amount: plan.amountInPaise,
    currency: order.currency,
    status: "created",
    razorpayOrderId: order.id,
    receipt: order.receipt ?? null,
    notes: (order.notes as Record<string, unknown>) ?? null,
    customerEmail: customerEmail ?? null,
    customerName: customerName ?? null,
  });

  return {
    order,
    plan,
    billingOrder,
  };
};

export const verifyRazorpayPaymentService = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  userId,
}: VerifyPaymentParams) => {
  if (!Env.RAZORPAY_KEY_SECRET) {
    throw new InternalServerException(
      "Razorpay credentials are not configured. Please set RAZORPAY_KEY_SECRET."
    );
  }

  const billingOrder = await BillingOrderModel.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!billingOrder) {
    throw new NotFoundException("Order not found or already processed.");
  }

  if (billingOrder.status === "paid") {
    return billingOrder;
  }

  const generatedSignature = createHmac("sha256", Env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new UnauthorizedException("Invalid Razorpay signature.");
  }

  billingOrder.status = "paid";
  billingOrder.razorpayPaymentId = razorpay_payment_id;
  billingOrder.razorpaySignature = razorpay_signature;
  billingOrder.paidAt = new Date();

  await billingOrder.save();

  return billingOrder;
};

export type RazorpayOrderResponse = Awaited<
  ReturnType<typeof createRazorpayOrderService>
>;

export type RazorpayVerifyResponse = Awaited<
  ReturnType<typeof verifyRazorpayPaymentService>
>;

