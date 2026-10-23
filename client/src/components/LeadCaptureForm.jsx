import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { apiRequest } from "../lib/api";

export default function LeadCaptureForm() {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await apiRequest("/leads", {
        method: "POST",
        body: JSON.stringify({
          name: values.get("name"),
          phone: values.get("phone"),
          email: values.get("email") || undefined,
          tipsOptIn: values.get("tipsOptIn") === "on",
          referralCode: new URLSearchParams(window.location.search).get("ref") || undefined,
        }),
      });
      setSubmitted(true);
      form.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-brand-50/70" id="updates">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
            A note from Marthington
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
            Helpful care tips, only if you want them.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Leave your contact details to ask about support. Choose separately whether you would
            like to receive occasional maternal health tips. You can contact the practice to opt out.
          </p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="flex items-start gap-3 text-emerald-800" role="status">
              <CheckCircle2 className="mt-0.5 shrink-0" size={21} />
              <p>Thank you. Your enquiry has been received.</p>
            </div>
          ) : (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <label className="text-sm font-semibold text-slate-700">
                Name
                <input
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
                  maxLength={120}
                  name="name"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                WhatsApp number
                <input
                  autoComplete="tel"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
                  maxLength={32}
                  name="phone"
                  required
                  type="tel"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Email (optional)
                <input
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
                  maxLength={254}
                  name="email"
                  type="email"
                />
              </label>
              <label className="flex items-start gap-3 text-sm font-normal leading-6 text-slate-600 sm:col-span-2">
                <input className="mt-1 accent-brand-600" name="tipsOptIn" type="checkbox" />
                <span>I agree to receive occasional maternal health tips and understand I can opt out.</span>
              </label>
              {error && (
                <p className="text-sm text-red-700 sm:col-span-2" role="alert">
                  {error}
                </p>
              )}
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:col-span-2"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Sending…" : "Send an enquiry"}
                {!submitting && <ArrowRight size={17} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
