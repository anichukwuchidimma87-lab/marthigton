import { useState } from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { apiRequest } from "../lib/api";

function localDateTimeValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function AppointmentRequestForm({ services, initialServiceId, onClose }) {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const minimumTime = localDateTimeValue(new Date(Date.now() + 60_000));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          name: values.get("name"),
          phone: values.get("phone"),
          email: values.get("email") || undefined,
          serviceId: values.get("serviceId"),
          requestedAt: new Date(values.get("requestedAt")).toISOString(),
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
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="appointment-title"
        aria-modal="true"
        className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        {submitted ? (
          <div className="py-5 text-center">
            <CheckCircle2 className="mx-auto text-emerald-700" size={36} />
            <h2 className="mt-4 font-display text-2xl font-semibold text-slate-900">
              Request received
            </h2>
            <p className="mt-2 leading-6 text-slate-600">
              This is a request, not a confirmed appointment. The practice will contact you to
              confirm availability.
            </p>
            <button
              className="mt-6 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
              onClick={onClose}
              type="button"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <CalendarDays size={21} />
            </span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Appointment request
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900" id="appointment-title">
              Let’s find a time to talk.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pick a preferred time. Your appointment is not confirmed until the practice follows up.
              Please don’t include health details in this form.
            </p>
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
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
                Phone number
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
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Service
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-brand-500"
                  defaultValue={initialServiceId || services[0]?._id}
                  name="serviceId"
                  required
                >
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Preferred date and time
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
                  min={minimumTime}
                  name="requestedAt"
                  required
                  type="datetime-local"
                />
              </label>
              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2" role="alert">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 pt-1 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Sending request…" : "Request appointment"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
