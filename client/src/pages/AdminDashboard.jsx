import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  HeartHandshake,
  MessageCircle,
  Plus,
  Search,
  Users,
} from "lucide-react";
import WhatsAppModal from "../components/WhatsAppModal";
import { apiRequest } from "../lib/api";

export default function AdminDashboard({
  token,
  user,
  onLogout,
  onOpenMarketing,
  onOpenSettings,
}) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiRequest("/patients?limit=100", { token, signal: controller.signal })
      .then((result) => {
        setPatients(result.items);
        setLoadError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/appointments?limit=100", { token, signal: controller.signal })
      .then((result) => {
        setAppointments(result.items);
        setAppointmentError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setAppointmentError(error.message);
      });
    return () => controller.abort();
  }, [token]);

  const filteredPatients = patients.filter((patient) =>
    `${patient.name} ${patient.phone}`.toLowerCase().includes(query.toLowerCase()),
  );

  async function addPatient(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const phone = String(formData.get("phone")).trim();
    const email = String(formData.get("email")).trim();

    if (!name || !phone) {
      setFormError("Enter a name and WhatsApp number.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const result = await apiRequest("/patients", {
        token,
        method: "POST",
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          whatsappOptIn: formData.get("whatsappOptIn") === "on",
        }),
      });
      setPatients((current) => [result.patient, ...current]);
      setShowForm(false);
      form.reset();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateAppointmentStatus(appointmentId, status) {
    setAppointmentError("");
    try {
      const result = await apiRequest(`/appointments/${appointmentId}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId ? result.appointment : appointment,
        ),
      );
    } catch (error) {
      setAppointmentError(error.message);
    }
  }

  if (!["admin", "superAdmin"].includes(user.role)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          Your account does not have permission to access the practice workspace.
          <button className="ml-3 font-semibold underline" onClick={onLogout} type="button">
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            {user.role === "superAdmin" ? "Owner workspace" : "Practice workspace"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900">
            Good care starts with connection.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Signed in as {user.name}. Manage contacts and consented WhatsApp follow-ups.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user.role === "superAdmin" && (
            <button
              className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onOpenSettings}
              type="button"
            >
              System settings
            </button>
          )}
          <button
            className="rounded-full border border-brand-200 px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50"
            onClick={onOpenMarketing}
            type="button"
          >
            Growth workspace
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
            onClick={() => setShowForm((visible) => !visible)}
            type="button"
          >
            <Plus size={18} />
            Add a contact
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

      <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <span className="mt-0.5 shrink-0">Privacy</span>
        <p>
          Only collect information needed for follow-up. Clinical notes and medical history are not
          available in this workspace. Confirm local privacy requirements before entering live client data.
        </p>
      </div>

      {showForm && (
        <form
          className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={addPatient}
        >
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
            Email (optional)
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
              maxLength={254}
              name="email"
              type="email"
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
          <label className="flex items-start gap-3 text-sm font-medium text-slate-700 sm:col-span-2">
            <input className="mt-1 accent-brand-600" name="whatsappOptIn" type="checkbox" />
            <span>
              This person has agreed to receive WhatsApp messages from the practice. Leave
              unchecked if permission has not been given.
            </span>
          </label>
          <button
            className="self-end rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save contact"}
          </button>
          {formError && (
            <p className="text-sm text-red-700 sm:col-span-3" role="alert">
              {formError}
            </p>
          )}
        </form>
      )}

      <section aria-label="Practice overview" className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={Users} label="Contacts" value={patients.length} />
        <SummaryCard
          icon={HeartHandshake}
          label="Active care"
          value={patients.filter((patient) => patient.status === "active").length}
        />
        <SummaryCard
          icon={CalendarDays}
          label="Open requests"
          value={appointments.filter((appointment) =>
            ["requested", "confirmed"].includes(appointment.status),
          ).length}
        />
      </section>

      <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Appointment requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            Requests remain unconfirmed until staff review and contact the requester.
          </p>
        </div>
        {appointmentError && (
          <p className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
            {appointmentError}
          </p>
        )}
        {appointments.length ? (
          <ul className="divide-y divide-slate-100">
            {appointments.map((appointment) => (
              <li
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                key={appointment._id}
              >
                <div>
                  <p className="font-semibold text-slate-900">{appointment.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {appointment.service?.name || "Service unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(appointment.requestedAt).toLocaleString()} · {appointment.phone}
                  </p>
                </div>
                <label className="text-sm font-medium text-slate-600">
                  Status
                  <select
                    className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
                    onChange={(event) =>
                      updateAppointmentStatus(appointment._id, event.target.value)
                    }
                    value={appointment.status}
                  >
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No appointment requests yet.
          </p>
        )}
      </section>

      <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">Recent contacts</h2>
            <p className="mt-1 text-sm text-slate-500">Basic contact records and WhatsApp permission status.</p>
          </div>
          <label className="relative block sm:w-72">
            <Search aria-hidden="true" className="absolute left-3 top-3.5 text-slate-400" size={17} />
            <input
              aria-label="Search contacts"
              className="w-full rounded-full border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts"
              value={query}
            />
          </label>
        </div>
        {loadError && (
          <p className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">
            {loadError}
          </p>
        )}
        {loading ? (
          <p className="p-10 text-center text-sm text-slate-500">Loading contacts…</p>
        ) : filteredPatients.length ? (
          <ul className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <li className="flex flex-wrap items-center justify-between gap-4 p-5" key={patient._id || patient.id}>
                <div>
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {statusLabel(patient.status)}
                  </span>
                  {patient.whatsappOptIn ? (
                    <button
                      aria-label={`Message ${patient.name} on WhatsApp`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700"
                      onClick={() => setSelectedPatient(patient)}
                      type="button"
                    >
                      <MessageCircle size={16} />
                      <span className="hidden sm:inline">WhatsApp</span>
                      <ArrowUpRight aria-hidden="true" size={14} />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">No WhatsApp consent</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Users size={22} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              {query ? "No matching contacts" : "No contacts yet"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {query ? "Try another name or number." : "Add a contact to get started."}
            </p>
          </div>
        )}
      </section>

      {selectedPatient && (
        <WhatsAppModal
          onClose={() => setSelectedPatient(null)}
          patient={selectedPatient}
        />
      )}
    </main>
  );
}

function statusLabel(status) {
  if (status === "postpartumFollowUp") return "Postpartum follow-up";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}
