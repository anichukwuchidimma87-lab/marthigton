import { useEffect, useState } from "react";
import { Megaphone, Plus, RefreshCw, Settings2, Users } from "lucide-react";
import { apiRequest } from "../lib/api";

const tabs = [
  { id: "leads", label: "Leads", icon: Users },
  { id: "campaigns", label: "Campaign drafts", icon: Megaphone },
  { id: "services", label: "Services", icon: Settings2 },
];

export default function MarketingWorkspace({ token, user, onBack, onLogout }) {
  const canManageServices = user.role === "superAdmin";
  const [tab, setTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);

  async function loadData(signal) {
    setLoading(true);
    setError("");
    try {
      const [leadResult, campaignResult] = await Promise.all([
        apiRequest("/leads?limit=100", { token, signal }),
        apiRequest("/campaigns", { token, signal }),
      ]);
      setLeads(leadResult.items);
      setCampaigns(campaignResult.items);
      if (canManageServices) {
        const serviceResult = await apiRequest("/services/manage", { token, signal });
        setServices(serviceResult.items);
      }
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [token, canManageServices]);

  async function updateLeadStatus(leadId, status) {
    setError("");
    setNotice("");
    try {
      const result = await apiRequest(`/leads/${leadId}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setLeads((current) =>
        current.map((lead) => (lead._id === leadId ? result.lead : lead)),
      );
      setNotice("Lead status updated.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveCampaign(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest("/campaigns", {
        token,
        method: "POST",
        body: JSON.stringify({
          name: values.get("name"),
          objective: values.get("objective"),
          messageTemplate: values.get("messageTemplate") || undefined,
        }),
      });
      setCampaigns((current) => [result.campaign, ...current]);
      form.reset();
      setNotice("Campaign saved as a draft. No messages were sent.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateCampaignStatus(campaignId, status) {
    setError("");
    setNotice("");
    try {
      const result = await apiRequest(`/campaigns/${campaignId}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setCampaigns((current) =>
        current.map((campaign) =>
          campaign._id === campaignId ? result.campaign : campaign,
        ),
      );
      setNotice("Campaign status updated. This does not trigger outreach.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveService(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const serviceId = values.get("serviceId");
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const body = {
        name: values.get("name"),
        description: values.get("description"),
        price: values.get("price") ? Number(values.get("price")) : null,
        currency: values.get("currency"),
      };
      const result = await apiRequest(
        serviceId ? `/services/${serviceId}` : "/services",
        {
          token,
          method: serviceId ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      setServices((current) =>
        serviceId
          ? current.map((service) =>
              service._id === serviceId ? result.service : service,
            )
          : [...current, result.service].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingService(null);
      form.reset();
      setNotice("Service details saved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function setServiceActive(service, active) {
    setError("");
    setNotice("");
    try {
      const result = await apiRequest(`/services/${service._id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      setServices((current) =>
        current.map((item) => (item._id === service._id ? result.service : item)),
      );
      setNotice(active ? "Service published." : "Service unpublished.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!["admin", "superAdmin"].includes(user.role)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          Your account cannot access marketing tools.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Growth workspace
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900">
            Outreach, thoughtfully planned.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Review enquiries, prepare campaign drafts, and keep public service information current.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onBack}
            type="button"
          >
            Practice dashboard
          </button>
          <button
            className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="Growth tools">
        {tabs.filter((item) => item.id !== "services" || canManageServices).map(({ id, label, icon: Icon }) => (
          <button
            aria-selected={tab === id}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
              tab === id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id={`tab-${id}`}
            key={id}
            onClick={() => {
              setTab(id);
              setNotice("");
              setError("");
            }}
            role="tab"
            type="button"
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          {notice}
        </p>
      )}
      {loading ? (
        <p className="py-16 text-center text-slate-500">Loading growth workspace…</p>
      ) : (
        <>
          {tab === "leads" && (
            <section aria-labelledby="tab-leads" className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-6">
                <h2 className="font-display text-2xl font-semibold text-slate-900">Enquiries</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tip subscription consent is shown separately. Update status after you follow up.
                </p>
              </div>
              {leads.length ? (
                <ul className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <li className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center" key={lead._id}>
                      <div>
                        <p className="font-semibold text-slate-900">{lead.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {lead.phone}{lead.email ? ` · ${lead.email}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.referralCode ? `Referral: ${lead.referralCode} · ` : ""}
                          Tips opt-in: {lead.tipsOptIn ? "Yes" : "No"}
                          {lead.createdAt ? ` · ${new Date(lead.createdAt).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <label className="text-sm font-medium text-slate-600">
                        Status
                        <select
                          className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
                          onChange={(event) => updateLeadStatus(lead._id, event.target.value)}
                          value={lead.status}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                        </select>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState message="No enquiries have been received yet." />
              )}
            </section>
          )}

          {tab === "campaigns" && (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <form className="rounded-3xl border border-slate-200 bg-white p-6" onSubmit={saveCampaign}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Plus size={18} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-slate-900">New campaign draft</h2>
                    <p className="text-sm text-slate-500">Planning only—nothing is sent.</p>
                  </div>
                </div>
                <label className="mt-6 block text-sm font-semibold text-slate-700">
                  Campaign name
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" maxLength={160} name="name" required />
                </label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Objective
                  <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" maxLength={2000} name="objective" required />
                </label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Optional message draft
                  <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" maxLength={5000} name="messageTemplate" />
                </label>
                <button className="mt-5 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60" disabled={saving} type="submit">
                  {saving ? "Saving…" : "Save campaign draft"}
                </button>
              </form>
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">Campaign plans</h2>
                </div>
                {campaigns.length ? (
                  <ul className="divide-y divide-slate-100">
                    {campaigns.map((campaign) => (
                      <li className="p-5" key={campaign._id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{campaign.objective}</p>
                          </div>
                          <select
                            aria-label={`Status for ${campaign.name}`}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            onChange={(event) => updateCampaignStatus(campaign._id, event.target.value)}
                            value={campaign.status}
                          >
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        {campaign.messageTemplate && (
                          <details className="mt-3 rounded-xl bg-slate-50 p-3">
                            <summary className="cursor-pointer text-sm font-semibold text-slate-700">View message draft</summary>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{campaign.messageTemplate}</p>
                          </details>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="No campaign drafts yet." />
                )}
              </section>
            </div>
          )}

          {tab === "services" && canManageServices && (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <form
                className="rounded-3xl border border-slate-200 bg-white p-6"
                key={editingService?._id || "new-service"}
                onSubmit={saveService}
              >
                <input name="serviceId" type="hidden" value={editingService?._id || ""} />
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  {editingService ? "Edit service" : "Add a service"}
                </h2>
                <label className="mt-5 block text-sm font-semibold text-slate-700">
                  Service name
                  <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" defaultValue={editingService?.name || ""} maxLength={160} name="name" required />
                </label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Description
                  <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" defaultValue={editingService?.description || ""} maxLength={3000} name="description" required />
                </label>
                <div className="mt-4 grid grid-cols-[1fr_6rem] gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Price (optional)
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500" defaultValue={editingService?.price ?? ""} min="0" name="price" step="0.01" type="number" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Currency
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal uppercase outline-none focus:border-brand-500" defaultValue={editingService?.currency || "NGN"} maxLength={3} minLength={3} name="currency" required />
                  </label>
                </div>
                <div className="mt-5 flex gap-3">
                  <button className="flex-1 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60" disabled={saving} type="submit">
                    {saving ? "Saving…" : editingService ? "Save changes" : "Create service"}
                  </button>
                  {editingService && (
                    <button className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700" onClick={() => setEditingService(null)} type="button">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-slate-900">Service catalogue</h2>
                    <p className="mt-1 text-sm text-slate-500">Only active services appear publicly.</p>
                  </div>
                  <button aria-label="Reload services" className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => {
                    const controller = new AbortController();
                    apiRequest("/services/manage", { token, signal: controller.signal })
                      .then((result) => setServices(result.items))
                      .catch((requestError) => setError(requestError.message));
                  }} type="button">
                    <RefreshCw size={17} />
                  </button>
                </div>
                {services.length ? (
                  <ul className="divide-y divide-slate-100">
                    {services.map((service) => (
                      <li className="flex flex-col gap-4 p-5" key={service._id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{service.name}</h3>
                            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">{service.description}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-800">
                              {service.price == null ? "Price by enquiry" : `${service.currency} ${Number(service.price).toLocaleString()}`}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${service.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                            {service.active ? "Published" : "Hidden"}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setEditingService(service)} type="button">
                            Edit
                          </button>
                          <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setServiceActive(service, !service.active)} type="button">
                            {service.active ? "Unpublish" : "Publish"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="No services have been added yet." />
                )}
              </section>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function EmptyState({ message }) {
  return <p className="px-6 py-12 text-center text-sm text-slate-500">{message}</p>;
}
