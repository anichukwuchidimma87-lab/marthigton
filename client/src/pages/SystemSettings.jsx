import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, ImagePlus, ShieldCheck } from "lucide-react";
import { API_BASE_URL, apiRequest } from "../lib/api";

export default function SystemSettings({ token, onBack, onBrandingChange }) {
  const [configuration, setConfiguration] = useState(null);
  const [branding, setBranding] = useState({
    brandName: "Marthington",
    tagline: "Family & maternal care",
    logoDataUrl: null,
  });
  const [error, setError] = useState("");
  const [brandingNotice, setBrandingNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/admin/configuration", { token, signal: controller.signal })
      .then((result) => {
        setConfiguration(result.configuration);
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

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/branding", { signal: controller.signal })
      .then(({ branding: savedBranding }) => {
        setBranding(savedBranding);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      });
    return () => controller.abort();
  }, []);

  async function saveBranding(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingBranding(true);
    setError("");
    setBrandingNotice("");
    try {
      const result = await apiRequest("/admin/branding", {
        token,
        method: "PUT",
        body: JSON.stringify({
          brandName: form.get("brandName"),
          tagline: form.get("tagline"),
        }),
      });
      setBranding(result.branding);
      onBrandingChange(result.branding);
      setBrandingNotice("Website name and tagline updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingBranding(false);
    }
  }

  async function uploadLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPEG, or WebP logo image.");
      return;
    }
    if (file.size > 256 * 1024) {
      setError("Logo images must be 256 KB or smaller.");
      return;
    }

    setSavingBranding(true);
    setError("");
    setBrandingNotice("");
    try {
      const result = await apiRequest("/admin/branding/logo", {
        token,
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setBranding(result.branding);
      onBrandingChange(result.branding);
      setBrandingNotice("Logo updated across the website and browser tab.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingBranding(false);
    }
  }

  async function removeLogo() {
    setSavingBranding(true);
    setError("");
    setBrandingNotice("");
    try {
      const result = await apiRequest("/admin/branding/logo", {
        token,
        method: "DELETE",
      });
      setBranding(result.branding);
      onBrandingChange(result.branding);
      setBrandingNotice("Default website mark restored.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingBranding(false);
    }
  }

  const checks = configuration
    ? [
        {
          name: "MongoDB connection",
          ready: configuration.database.configured && configuration.database.connected,
          detail: configuration.database.connected
            ? "URI is configured and the API is connected."
            : configuration.database.configured
              ? "URI is configured, but the database is not connected."
              : "MONGODB_URI is not configured.",
          secret: true,
        },
        {
          name: "JWT signing secret",
          ready: configuration.jwtSecret.meetsMinimumLength,
          detail: configuration.jwtSecret.meetsMinimumLength
            ? "Configured and meets the minimum length."
            : "JWT_SECRET is missing or shorter than 32 characters.",
          secret: true,
        },
        {
          name: "Allowed client origins",
          ready: configuration.clientOrigins.configured,
          detail: configuration.clientOrigins.configured
            ? `${configuration.clientOrigins.count} origin(s) configured.`
            : "Using the local development default; set CLIENT_ORIGINS for deployment.",
          secret: false,
        },
        {
          name: "API port",
          ready: true,
          detail: `${configuration.port.value}${configuration.port.configured ? " (configured)" : " (default)"}`,
          secret: false,
        },
      ]
    : [];

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Owner tools
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900">
            Runtime configuration
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Check whether the API has its deployment configuration. Secret values are never sent
            to this page.
          </p>
        </div>
        <button
          className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onBack}
          type="button"
        >
          Practice dashboard
        </button>
      </div>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-800" size={20} />
          <div>
            <h2 className="font-semibold text-amber-950">Why secrets aren’t editable here</h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Database URIs and signing keys grant access to private systems. This dashboard only
              reports whether they are set—it cannot reveal, replace, or store their values. Update
              them in the hosting provider’s protected environment settings, then restart or redeploy
              the service.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {brandingNotice && (
        <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {brandingNotice}
        </p>
      )}

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Website appearance
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">
            Logo and company name
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Updates appear in the sidebar, mobile header, and browser tab. Use a small square or
            landscape PNG, JPEG, or WebP image (maximum 256 KB).
          </p>
        </div>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveBranding}>
          <label className="text-sm font-semibold text-slate-700">
            Company name
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
              defaultValue={branding.brandName}
              key={`brand-${branding.brandName}`}
              maxLength={80}
              name="brandName"
              required
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Sidebar tagline
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
              defaultValue={branding.tagline}
              key={`tagline-${branding.tagline}`}
              maxLength={120}
              name="tagline"
              required
            />
          </label>
          <button
            className="rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
            disabled={savingBranding}
            type="submit"
          >
            Save website name and tagline
          </button>
        </form>

        <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
          {branding.logoDataUrl ? (
            <img
              alt="Current website logo"
              className="h-16 w-16 rounded-2xl border border-slate-200 object-contain p-2"
              src={branding.logoDataUrl}
            />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <ImagePlus size={25} />
            </span>
          )}
          <label className="cursor-pointer rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {savingBranding ? "Saving…" : branding.logoDataUrl ? "Replace logo" : "Upload logo"}
            <input
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={savingBranding}
              onChange={uploadLogo}
              type="file"
            />
          </label>
          {branding.logoDataUrl && (
            <button
              className="rounded-full px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              disabled={savingBranding}
              onClick={removeLogo}
              type="button"
            >
              Remove logo
            </button>
          )}
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">API environment</h2>
          <p className="mt-1 text-sm text-slate-500">
            {configuration ? `Runtime environment: ${configuration.nodeEnvironment}` : "Private values are not displayed."}
          </p>
        </div>
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Checking API configuration…</p>
        ) : configuration ? (
          <ul className="divide-y divide-slate-100">
            {checks.map((check) => (
              <li className="flex flex-wrap items-start justify-between gap-3 p-5" key={check.name}>
                <div className="flex items-start gap-3">
                  {check.ready ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={19} />
                  ) : (
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={19} />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{check.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {check.secret ? "Secret value hidden" : "Non-secret"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 shrink-0 text-brand-700" size={21} />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Where to change settings</h2>
            <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-6 text-slate-600">
              <li>
                In Render, open the private API service, then <strong>Environment</strong>. Set
                {" "} <code className="rounded bg-slate-100 px-1.5 py-0.5">MONGODB_URI</code>,
                {" "} <code className="rounded bg-slate-100 px-1.5 py-0.5">JWT_SECRET</code>,
                {" "} <code className="rounded bg-slate-100 px-1.5 py-0.5">CLIENT_ORIGINS</code>,
                and any required platform variables such as{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5">PORT</code>. Save changes and
                restart/redeploy the API.
              </li>
              <li>
                In Vercel, open the client project’s <strong>Settings → Environment Variables</strong>.
                Set the public API origin as{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5">API_URL</code>, then redeploy
                the client. Never put database credentials or signing keys in Vercel client variables.
              </li>
            </ol>
            <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              Current public API endpoint in this client build: {API_BASE_URL}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                href="https://dashboard.render.com/"
                rel="noreferrer"
                target="_blank"
              >
                Open Render dashboard <ExternalLink size={15} />
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                href="https://vercel.com/dashboard"
                rel="noreferrer"
                target="_blank"
              >
                Open Vercel dashboard <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
