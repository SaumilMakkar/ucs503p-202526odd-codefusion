import { z } from "zod";

export const createOrderSchema = z.object({
  planId: z.string().min(1, "Plan identifier is required"),
});

export const verifyOrderSchema = z.object({
  razorpay_order_id: z.string().min(1, "Razorpay order id is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay payment id is required"),
  razorpay_signature: z.string().min(1, "Razorpay signature is required"),
});

export type CreateOrderSchemaType = z.infer<typeof createOrderSchema>;
export type VerifyOrderSchemaType = z.infer<typeof verifyOrderSchema>;

