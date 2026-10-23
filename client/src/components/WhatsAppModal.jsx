import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

export default function WhatsAppModal({ patient, onClose }) {
  const [message, setMessage] = useState(
    `Hello ${patient.name}, this is Marthington. How can we support you today?`,
  );
  const phone = normalizePhone(patient.phone);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="whatsapp-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Outreach
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900" id="whatsapp-title">
              Message {patient.name}
            </h2>
          </div>
          <button
            aria-label="Close message window"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="whatsapp-message">
          Message
        </label>
        <textarea
          className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-slate-200 p-4 text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          id="whatsapp-message"
          maxLength={2000}
          onChange={(event) => setMessage(event.target.value)}
          value={message}
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          WhatsApp opens in a new tab. This prototype does not send or record messages.
        </p>
        <a
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white ${
            phone ? "bg-[#188653] hover:bg-[#126b42]" : "pointer-events-none bg-slate-300"
          }`}
          href={phone ? whatsappUrl : undefined}
          rel="noreferrer"
          target="_blank"
          aria-disabled={!phone}
        >
          <MessageCircle size={18} />
          Continue to WhatsApp
        </a>
      </section>
    </div>
  );
}
