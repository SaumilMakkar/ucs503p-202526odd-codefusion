import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSubmitComplaintMutation } from "@/features/complaint/complaintAPI";
import { Loader2 } from "lucide-react";

/**
 * Complaint form validation schema
 */
const complaintSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-()]+$/.test(val),
      "Invalid phone number format"
    ),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

const AboutUs = () => {
  const [submitComplaint, { isLoading: isSubmitting }] = useSubmitComplaintMutation();
  
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    try {
      const response = await submitComplaint(data).unwrap();
      toast.success(response.message || "Complaint submitted successfully!");
      form.reset();
    } catch (error: any) {
      console.error("Complaint submission error:", error);
      toast.error(
        error?.data?.message || "Failed to submit complaint. Please try again."
      );
    }
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 px-8 py-10 text-white shadow-lg">
        <h1 className="text-3xl font-semibold">About Finora</h1>
        <p className="mt-3 max-w-3xl text-base text-white/90">
          Finora is a collaborative platform designed to help teams ideate,
          plan, and deliver software with confidence. From product discovery to
          release readiness, we bring every workflow into one streamlined,
          beautifully crafted experience.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-5 backdrop-blur">
            <h3 className="text-lg font-medium">Product Vision</h3>
            <p className="mt-2 text-sm text-white/80">
              We focus on clarity and velocity—giving builders the context they
              need to move fast without breaking things.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-5 backdrop-blur">
            <h3 className="text-lg font-medium">Crafted For Teams</h3>
            <p className="mt-2 text-sm text-white/80">
              Designers, engineers, and stakeholders share a common language
              through living documentation, actionable dashboards, and rich
              history.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-5 backdrop-blur">
            <h3 className="text-lg font-medium">Secure & Reliable</h3>
            <p className="mt-2 text-sm text-white/80">
              Enterprise-grade security, regional failover, and proactive
              monitoring keep your team and your customers protected.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-10 rounded-2xl bg-white p-8 shadow-lg md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            How We Make A Difference
          </h2>
          <p className="text-sm text-gray-600">
            Finora brings clarity to complex projects. Our intelligent
            automations surface risks before they become blockers, while our
            analytics help teams forecast impact with precision. Whether you are
            shipping your first product or scaling globally, Finora adapts to
            your workflow and grows with you.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Collaborative Roadmaps
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Align on milestones, visualize dependencies, and keep everyone in
                sync across time zones.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Insights That Matter
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Real-time dashboards turn raw data into actionable insights so
                teams can make confident decisions faster.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Seamless Integrations
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Integrate with the tools you already rely on—GitHub, Figma,
                Linear, Slack, and more.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Human-Centered Support
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                A dedicated success team partners with you to tailor onboarding,
                adoption, and long-term success.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-xl bg-slate-900 p-6 text-white">
          <div>
            <h3 className="text-lg font-semibold">Need to Reach Us?</h3>
            <p className="mt-2 text-sm text-white/80">
              Our team is available 24/7. Expect a response within one business
              day—usually much faster.
            </p>
          </div>
          <div className="space-y-4 text-sm text-white/80">
            <p>
              <span className="block text-white">Headquarters</span>
              221B Innovation Way, Suite 500
              <br />
              San Francisco, CA 94107
            </p>
            <p>
              <span className="block text-white">Email</span>
              support@codefusion.app
            </p>
            <p>
              <span className="block text-white">Phone</span>
              +1 (844) 555-0199
            </p>
            <p>
              <span className="block text-white">Live Chat</span>
              Available directly in-app weekdays 8am–8pm PT
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Register A Complaint Or Share Feedback
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              We take every concern seriously. Provide your details and we will
              follow up with a tailored resolution plan. You will receive a
              ticket number instantly and can track progress through your inbox.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>
                  Dedicated complaint specialists review submissions within 4
                  hours.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>
                  Escalation paths straight to our leadership team when needed.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>
                  Transparent status updates sent at every stage of the process.
                </span>
              </li>
            </ul>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 rounded-xl border border-slate-100 bg-slate-50 p-6"
          >
            <div>
              <label
                className="text-sm font-medium text-gray-800"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                {...form.register("fullName")}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-500/30 ${
                  form.formState.errors.fullName
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
                id="fullName"
                placeholder="Jane Doe"
                type="text"
                disabled={isSubmitting}
              />
              {form.formState.errors.fullName && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="text-sm font-medium text-gray-800"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  {...form.register("email")}
                  className={`mt-2 w-full rounded-lg border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-500/30 ${
                    form.formState.errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                  id="email"
                  placeholder="jane@company.com"
                  type="email"
                  disabled={isSubmitting}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="text-sm font-medium text-gray-800"
                  htmlFor="phone"
                >
                  Phone (optional)
                </label>
                <input
                  {...form.register("phone")}
                  className={`mt-2 w-full rounded-lg border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-500/30 ${
                    form.formState.errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-blue-500"
                  }`}
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  disabled={isSubmitting}
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                className="text-sm font-medium text-gray-800"
                htmlFor="subject"
              >
                Subject
              </label>
              <input
                {...form.register("subject")}
                className={`mt-2 w-full rounded-lg border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-500/30 ${
                  form.formState.errors.subject
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
                id="subject"
                placeholder="Brief title for your issue"
                type="text"
                disabled={isSubmitting}
              />
              {form.formState.errors.subject && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.subject.message}
                </p>
              )}
            </div>
            <div>
              <label
                className="text-sm font-medium text-gray-800"
                htmlFor="message"
              >
                Details
              </label>
              <textarea
                {...form.register("message")}
                className={`mt-2 h-32 w-full rounded-lg border bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-500/30 ${
                  form.formState.errors.message
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
                id="message"
                placeholder="Let us know what happened, what you expected, and how we can help."
                disabled={isSubmitting}
              />
              {form.formState.errors.message && (
                <p className="mt-1 text-xs text-red-500">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>
            <button
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Complaint"
              )}
            </button>
            <p className="text-xs text-gray-500">
              By submitting, you consent to us storing your information so we can
              respond to your request. View our privacy promise in the legal
              center.
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}

export default AboutUs

