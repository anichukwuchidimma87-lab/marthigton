import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy, Link2, Users } from "lucide-react";
import { apiRequest } from "../lib/api";

export default function AgentDashboard({ token, user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/agents/me/stats", { token, signal: controller.signal })
      .then((result) => {
        setStats(result);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  const referralLink = stats
    ? `${window.location.origin}/?ref=${encodeURIComponent(stats.referralCode)}`
    : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Select and copy the referral link manually.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Agent workspace
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900">
            Welcome, {user.name}.
          </h1>
          <p className="mt-3 text-slate-600">
            Share your link and follow aggregate enquiry activity.
          </p>
        </div>
        <button
          className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onLogout}
          type="button"
        >
          Sign out
        </button>
      </div>

      <section className="mt-8 rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Link2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Your referral link</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Share this link to attribute new enquiries to your referral code. It does not include
              or reveal enquiry contact details.
            </p>
            {stats && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  aria-label="Your referral link"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  onFocus={(event) => event.target.select()}
                  readOnly
                  value={referralLink}
                />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
                  onClick={copyLink}
                  type="button"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-16 text-center text-slate-500">Loading referral activity…</p>
      ) : stats ? (
        <>
          <section aria-label="Referral metrics" className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total enquiries" value={stats.summary.total} />
            <Metric label="New" value={stats.summary.new} />
            <Metric label="Contacted" value={stats.summary.contacted} />
            <Metric label="Converted" value={stats.summary.converted} />
          </section>
          <section className="mt-6 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-500">Tips opt-ins from referrals</p>
              <p className="mt-3 font-display text-4xl font-semibold text-slate-900">
                {stats.summary.tipsOptIn}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                People who separately chose to receive maternal health tips.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-brand-900 p-6 text-white">
              <Users className="text-brand-200" size={21} />
              <p className="mt-4 font-display text-2xl font-semibold">Share helpful information</p>
              <p className="mt-2 text-sm leading-6 text-brand-100/80">
                Please describe services accurately. Enquiries and appointment requests are not
                confirmed care bookings.
              </p>
              <a
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-brand-100"
                href="/#care"
                rel="noreferrer"
                target="_blank"
              >
                View public services <ArrowUpRight size={16} />
              </a>
            </article>
          </section>
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Referral statistics are currently unavailable.
        </p>
      )}
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
