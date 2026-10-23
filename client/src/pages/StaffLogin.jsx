import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { apiRequest } from "../lib/api";

export default function StaffLogin({ onLogin }) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      onLogin(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-16 sm:py-24">
      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <LockKeyhole size={22} />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Staff access
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
          Sign in to the practice
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Staff accounts must be provisioned by the practice owner. Patient accounts cannot sign in
          to this workspace.
        </p>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              name="password"
              required
              type="password"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          <button
            className="w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
