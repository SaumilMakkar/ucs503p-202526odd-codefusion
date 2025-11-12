import mongoose, { Document, Schema } from "mongoose";

export type BillingStatus = "created" | "paid" | "failed";

export interface BillingOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  planId: string;
  planName: string;
  planInterval: "quarterly" | "annual";
  amount: number;
  currency: string;
  status: BillingStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  receipt?: string | null;
  notes?: Record<string, unknown> | null;
  customerEmail?: string | null;
  customerName?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const billingOrderSchema = new Schema<BillingOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planInterval: {
      type: String,
      enum: ["quarterly", "annual"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    receipt: {
      type: String,
      default: null,
    },
    notes: {
      type: Schema.Types.Mixed,
      default: null,
    },
    customerEmail: {
      type: String,
      default: null,
    },
    customerName: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const BillingOrderModel = mongoose.model<BillingOrderDocument>(
  "BillingOrder",
  billingOrderSchema
);

export default BillingOrderModel;

