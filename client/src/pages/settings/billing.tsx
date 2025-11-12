import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type RazorpayPrefill = {
  name?: string
  email?: string
  contact?: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id?: string
  handler: (response: RazorpaySuccessResponse) => void
  prefill?: RazorpayPrefill
  notes?: Record<string, unknown>
  theme?: {
    color?: string
  }
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void
      on: (event: string, handler: () => void) => void
      close: () => void
    }
  }
}

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.id = "razorpay-checkout-js"
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const plans = [
  {
    id: "premium-quarterly",
    name: "Premium Quarterly",
    price: 8999,
    billingText: "₹8,999 / quarter",
    description:
      "Scale your product org with advanced workflow automation, insights, and secure collaboration.",
    features: [
      "Unlimited projects and documentation spaces",
      "Workflow automation & AI-powered summaries",
      "Advanced analytics dashboards with exports",
      "Priority success manager & 4-hour SLA",
    ],
    amountInPaise: 899900,
    notes: {
      interval: "quarterly",
    },
  },
  {
    id: "premium-annual",
    name: "Premium Annual",
    price: 29999,
    billingText: "₹29,999 / year",
    description:
      "Our best value plan with bundled launch support, dedicated onboarding, and advanced security controls.",
    features: [
      "Everything in Premium Quarterly",
      "Enterprise SSO & audit-ready access logs",
      "Custom data residency & backup policies",
      "Launch playbooks co-created with our team",
    ],
    amountInPaise: 2999900,
    notes: {
      interval: "annual",
    },
    highlight: true,
  },
]

const Billing = () => {
  const [isScriptReady, setIsScriptReady] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "loading" | "success" | "failed"
  >("idle")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const razorpayKey = useMemo(
    () => import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
    []
  )

  useEffect(() => {
    let mounted = true
    loadRazorpayScript().then((loaded) => {
      if (mounted) {
        setIsScriptReady(loaded)
        if (!loaded) {
          setStatusMessage(
            "We could not load Razorpay checkout. Please check your network connection and try again."
          )
        }
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const handlePurchase = useCallback(
    async (planId: string) => {
      const plan = plans.find((item) => item.id === planId)
      if (!plan) {
        setStatusMessage("Unable to find the selected plan. Please try again.")
        return
      }

      if (!isScriptReady || !window.Razorpay) {
        setStatusMessage(
          "Payment module is still loading. Please wait a moment and retry."
        )
        return
      }

      if (!razorpayKey) {
        setStatusMessage(
          "Razorpay key is not configured. Ask an administrator to set VITE_RAZORPAY_KEY_ID."
        )
        return
      }

      setPaymentStatus("loading")
      setStatusMessage("Opening Razorpay checkout…")

      try {
        // In production, create an order on your backend and pass the order_id to Razorpay options.
        const options: RazorpayOptions = {
          key: razorpayKey,
          amount: plan.amountInPaise,
          currency: "INR",
          name: "CodeFusion Premium",
          description: `${plan.name} subscription`,
          handler: (response: RazorpaySuccessResponse) => {
            setPaymentStatus("success")
            setStatusMessage(
              `Payment successful! Reference ID: ${response.razorpay_payment_id}. You will receive an onboarding email shortly.`
            )
          },
          prefill: {
            name: "CodeFusion User",
            email: "user@example.com",
            contact: "+911234567890",
          },
          notes: {
            ...plan.notes,
            planId: plan.id,
          },
          theme: {
            color: "#0f172a",
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
        razorpay.on("payment.failed", () => {
          setPaymentStatus("failed")
          setStatusMessage(
            "The payment was not completed. No money was deducted. Please try again or contact support."
          )
        })
      } catch (error) {
        setPaymentStatus("failed")
        setStatusMessage(
          error instanceof Error
            ? error.message
            : "We could not start the payment. Please try again."
        )
      }
    },
    [isScriptReady, razorpayKey]
  )

  return (
    <div className="space-y-10">
      <header className="rounded-2xl bg-slate-900 px-8 py-10 text-white shadow-lg">
        <Badge className="bg-blue-500 text-xs font-medium uppercase tracking-wide">
          Premium Access
        </Badge>
        <h1 className="mt-5 text-3xl font-semibold">
          Upgrade to CodeFusion Premium
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Unlock advanced collaboration, analytics, and priority support designed
          for high-performing product organizations. Choose a plan that matches
          your growth trajectory and check out securely with Razorpay.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/60">
          <span>• Secure UPI, card, and netbanking payments</span>
          <span>• Instant activation after successful payment</span>
          <span>• Cancel or upgrade anytime from your workspace</span>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            paymentStatus === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : paymentStatus === "failed"
              ? "border-red-200 bg-rose-50 text-rose-900"
              : "border-blue-200 bg-blue-50 text-blue-900"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
              plan.highlight ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {plan.description}
                  </p>
                </div>
                {plan.highlight && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Most Popular
                  </Badge>
                )}
              </div>

              <div>
                <span className="text-3xl font-bold text-slate-900">
                  {plan.billingText.split(" ")[0]}
                </span>
                <span className="ml-2 text-sm text-slate-500">
                  {plan.billingText
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                </span>
              </div>

              <Separator />

              <ul className="space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Button
                className="w-full"
                disabled={paymentStatus === "loading"}
                onClick={() => handlePurchase(plan.id)}
              >
                {paymentStatus === "loading"
                  ? "Launching Razorpay…"
                  : "Buy Now"}
              </Button>
              <p className="mt-3 text-xs text-slate-500">
                Taxes calculated at checkout. A receipt will be emailed after
                purchase.
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Need help?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Prefer an invoice? Want to discuss enterprise pricing? Reach out at{" "}
          <a
            className="font-medium text-blue-600 underline"
            href="mailto:billing@codefusion.app"
          >
            billing@codefusion.app
          </a>{" "}
          or schedule a call with our success team. We respond within one business
          day.
        </p>
      </section>
    </div>
  )
}

export default Billing
