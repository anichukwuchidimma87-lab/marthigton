import { useEffect, useState } from "react";
import { ArrowRight, Heart, Menu, MessageCircle, ShieldCheck } from "lucide-react";
import AdminDashboard from "./pages/AdminDashboard";
import MarketingWorkspace from "./pages/MarketingWorkspace";
import AgentDashboard from "./pages/AgentDashboard";
import SystemSettings from "./pages/SystemSettings";
import StaffLogin from "./pages/StaffLogin";
import LeadCaptureForm from "./components/LeadCaptureForm";
import AppointmentRequestForm from "./components/AppointmentRequestForm";
import AppSidebar from "./components/AppSidebar";
import { apiRequest } from "./lib/api";
import midwifeImage from "../../images/martha.jpg";
import fallbackFavicon from "../public/favicon.svg";

const defaultServices = [
  {
    number: "01",
    title: "Family planning guidance",
    description:
      "Understand available options and have a confidential conversation about what may suit your needs.",
  },
  {
    number: "02",
    title: "Antenatal support",
    description:
      "Personalized education and support as you prepare for birth and care for yourself during pregnancy.",
  },
  {
    number: "03",
    title: "Postnatal and newborn care",
    description:
      "Practical follow-up for new parents and guidance for the early weeks with your baby.",
  },
];

export default function App() {
  const [view, setView] = useState("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [branding, setBranding] = useState({
    name: "Marthington",
    tagline: "Family & maternal care",
    logoDataUrl: null,
    logoMimeType: null,
  });
  const [brandingError, setBrandingError] = useState("");
  const [services, setServices] = useState(defaultServices);
  const [serviceError, setServiceError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState("");
  const contactLink = "https://wa.me/2348132929712";

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/services", { signal: controller.signal })
      .then(({ items }) => {
        setServices(items.length ? items : defaultServices);
        setServiceError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setServiceError(error.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("/branding", { signal: controller.signal })
      .then(({ branding: savedBranding }) => {
        setBranding({
          name: savedBranding.brandName,
          tagline: savedBranding.tagline,
          logoDataUrl: savedBranding.logoDataUrl,
          logoMimeType: savedBranding.logoMimeType,
        });
        setBrandingError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setBrandingError(error.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    document.title = `${branding.name} | Family & maternal care`;
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = branding.logoDataUrl || fallbackFavicon;
      favicon.type = branding.logoMimeType || "image/svg+xml";
    }
  }, [branding]);

  function navigate(nextView) {
    setView(nextView);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateToSection(section) {
    if (view !== "home") {
      setView("home");
      window.setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileSidebarOpen(false);
  }

  function signOut() {
    setSession(null);
    setView("home");
    setMobileSidebarOpen(false);
  }

  function openBooking(serviceId = "") {
    setBookingServiceId(serviceId);
    setBookingOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#fffaf9] text-slate-800">
      <AppSidebar
        brand={branding}
        currentView={view}
        expanded={sidebarExpanded}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onLogout={signOut}
        onNavigate={navigate}
        onSection={navigateToSection}
        onToggle={() => setSidebarExpanded((expanded) => !expanded)}
        session={session}
      />
      <div className={`min-w-0 transition-[margin] duration-200 ${sidebarExpanded ? "md:ml-72" : "md:ml-20"}`}>
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-brand-100/80 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            aria-expanded={mobileSidebarOpen}
            aria-label="Open navigation menu"
            className="rounded-xl p-2 text-slate-700 hover:bg-brand-50"
            onClick={() => setMobileSidebarOpen(true)}
            type="button"
          >
            <Menu size={22} />
          </button>
          {branding.logoDataUrl ? (
            <img alt="" className="h-9 w-9 rounded-lg object-contain" src={branding.logoDataUrl} />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <Heart fill="currentColor" size={17} />
            </span>
          )}
          <span className="truncate font-display text-lg font-semibold text-brand-900">{branding.name}</span>
        </div>

      {view === "admin" ? (
        session ? (
          session.user.role === "agent" ? (
            <AgentDashboard onLogout={signOut} token={session.token} user={session.user} />
          ) : (
            <AdminDashboard
              onOpenMarketing={() => navigate("growth")}
              onOpenSettings={() => navigate("settings")}
              onLogout={signOut}
              token={session.token}
              user={session.user}
            />
          )
        ) : (
          <StaffLogin onLogin={setSession} />
        )
      ) : view === "growth" ? (
        session ? (
          <MarketingWorkspace
            onBack={() => navigate("admin")}
            onLogout={signOut}
            token={session.token}
            user={session.user}
          />
        ) : (
          <StaffLogin onLogin={setSession} />
        )
      ) : view === "settings" ? (
        session && session.user.role === "superAdmin" ? (
          <SystemSettings
            onBack={() => navigate("admin")}
            onBrandingChange={(savedBranding) =>
              setBranding({
                name: savedBranding.brandName,
                tagline: savedBranding.tagline,
                logoDataUrl: savedBranding.logoDataUrl,
                logoMimeType: savedBranding.logoMimeType,
              })
            }
            token={session.token}
          />
        ) : (
          <StaffLogin onLogin={setSession} />
        )
      ) : (
        <>
          <main>
            {brandingError && (
              <p className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-950">
                Saved website branding could not be loaded ({brandingError}); showing the default branding.
              </p>
            )}
            <section className="relative overflow-hidden">
              <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
              <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-orange-100/70 blur-3xl" />
              <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-sm font-medium text-brand-800">
                    <Heart fill="currentColor" size={15} />
                    Care and guidance, centered on you
                  </div>
                  <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
                    A little more support for your{" "}
                    <span className="text-brand-600">next chapter.</span>
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                    Thoughtful family planning and maternal health support in a respectful,
                    confidential space. Start with a conversation about what matters to you.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/15 transition hover:-translate-y-0.5 hover:bg-brand-700"
                      onClick={() => openBooking()}
                      type="button"
                    >
                      <MessageCircle size={18} />
                      Request an appointment
                    </button>
                    <a
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                      href="#care"
                    >
                      Explore our care
                      <ArrowRight size={17} />
                    </a>
                  </div>
                  <div className="mt-9 flex items-center gap-3 text-sm text-slate-500">
                    <ShieldCheck className="text-brand-600" size={19} />
                    Your questions deserve a kind, confidential conversation.
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-lg">
                  <div className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-brand-100/70" />
                  <div className="relative overflow-hidden rounded-[2.25rem] border-[8px] border-white bg-white shadow-2xl shadow-brand-900/10">
                    <img
                      alt="Marthington family planning and reproductive health support"
                      className="aspect-[4/4.5] w-full object-cover"
                      src={midwifeImage}
                    />
                    <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
                      <p className="font-display text-xl font-semibold text-slate-900">Your care, your choices.</p>
                      <p className="mt-1 text-sm text-slate-600">Personal guidance, one conversation at a time.</p>
                    </div>
                  </div>
                  <div className="absolute -left-7 top-10 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Here for you</p>
                    <p className="mt-1 font-display text-lg font-semibold text-brand-700">Every step</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-y border-brand-100/70 bg-white py-5">
              <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-12 gap-y-4 px-5 text-sm font-medium text-slate-600 sm:px-8">
                <span className="flex items-center gap-2"><ShieldCheck className="text-brand-600" size={17} /> Respectful guidance</span>
                <span className="flex items-center gap-2"><Heart className="text-brand-600" size={17} /> Personalized support</span>
                <span className="flex items-center gap-2"><MessageCircle className="text-brand-600" size={17} /> Easy WhatsApp contact</span>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" id="care">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">How we can help</p>
                <h2 className="mt-3 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
                  Care that meets you where you are.
                </h2>
                <p className="mt-4 leading-7 text-slate-600">
                  Every family is different. Reach out to talk through your needs and available options.
                </p>
              </div>
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {services.map((service, index) => (
                  <article className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={service._id || service.number}>
                    <span className="font-display text-3xl text-brand-300">{service.number || String(index + 1).padStart(2, "0")}</span>
                    <h3 className="mt-6 font-display text-2xl font-semibold text-slate-900">{service.name || service.title}</h3>
                    <p className="mt-3 min-h-20 leading-7 text-slate-600">{service.description}</p>
                    {service.price !== undefined && service.price !== null && (
                      <p className="mt-4 font-semibold text-slate-900">
                        {service.currency || "NGN"} {Number(service.price).toLocaleString()}
                      </p>
                    )}
                    {service._id ? (
                      <button
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
                        onClick={() => openBooking(service._id)}
                        type="button"
                      >
                        Request this service <ArrowRight size={16} />
                      </button>
                    ) : (
                      <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900" href={contactLink} rel="noreferrer" target="_blank">
                        Ask about this service <ArrowRight size={16} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
              {serviceError && (
                <p className="mt-5 text-center text-sm text-amber-800" role="status">
                  The live service list could not be loaded ({serviceError}). Showing general care information instead.
                </p>
              )}
              <p className="mt-6 text-center text-sm text-slate-500">
                Service availability and pricing are confirmed during your enquiry.
              </p>
            </section>

            <section className="bg-brand-900 text-white" id="about">
              <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_auto] md:items-center">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-200">A caring conversation</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">You can start with a question.</h2>
                  <p className="mt-4 leading-7 text-brand-100/80">
                    Ask about family planning, pregnancy support, or postnatal care. We’ll help you understand the next step.
                  </p>
                </div>
                <a className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-brand-900 transition hover:bg-brand-50" href={contactLink} rel="noreferrer" target="_blank">
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>
              </div>
            </section>
            <LeadCaptureForm />
          </main>
          <footer className="bg-white px-5 py-7 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} {branding.name}. Family planning and maternal health support.</p>
            <p className="mx-auto mt-2 max-w-3xl text-xs leading-5">
              This website provides general information and is not a substitute for individual medical advice or emergency care.
            </p>
          </footer>
          {bookingOpen && services.some((service) => service._id) && (
            <AppointmentRequestForm
              initialServiceId={bookingServiceId}
              onClose={() => setBookingOpen(false)}
              services={services.filter((service) => service._id)}
            />
          )}
          {bookingOpen && !services.some((service) => service._id) && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
              <section
                aria-labelledby="booking-unavailable-title"
                aria-modal="true"
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                role="dialog"
              >
                <h2 className="font-display text-2xl font-semibold text-slate-900" id="booking-unavailable-title">
                  Booking is not available online yet
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Contact the practice directly to request a conversation.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    className="rounded-full bg-brand-600 px-5 py-3 font-semibold text-white"
                    href={contactLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Contact on WhatsApp
                  </a>
                  <button
                    className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                    onClick={() => setBookingOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </section>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
