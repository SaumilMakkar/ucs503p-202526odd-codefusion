import { apiClient } from "@/app/api-client"

type CreateOrderRequest = string

type CreateOrderResponse = {
  message: string
  order: {
    id: string
    amount: number
    currency: string
    receipt: string | null
    amount_due: number
    amount_paid: number
    created_at: number
    status: string
    billingOrderId: string
  }
  plan: {
    id: string
    name: string
    amountInPaise: number
    interval: "quarterly" | "annual"
    description: string
  }
  customer: {
    name: string
    email: string
  }
  billingOrder: {
    id: string
    status: string
  }
}

type VerifyPaymentRequest = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type VerifyPaymentResponse = {
  message: string
  order: {
    id: string
    status: string
    paidAt?: string
    razorpayPaymentId?: string | null
  }
  plan: {
    id: string
    name: string
    interval: "quarterly" | "annual"
    amount: number
  }
}

export const billingApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (planId) => ({
        url: "/billing/create-order",
        method: "POST",
        body: { planId },
      }),
    }),
    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (body) => ({
        url: "/billing/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["billingSubscription"],
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} = billingApi

