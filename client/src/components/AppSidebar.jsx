import {
  CalendarDays,
  Heart,
  HeartHandshake,
  Home,
  Info,
  LogOut,
  Megaphone,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
  X,
} from "lucide-react";

export default function AppSidebar({
  brand,
  expanded,
  mobileOpen,
  session,
  currentView,
  onToggle,
  onCloseMobile,
  onNavigate,
  onSection,
  onLogout,
}) {
  const links = session
    ? [
        { label: "Public website", icon: Home, action: () => onNavigate("home"), active: currentView === "home" },
        ...(session.user.role === "agent"
          ? [{ label: "Agent dashboard", icon: UserRound, action: () => onNavigate("admin"), active: currentView === "admin" }]
          : [
              { label: "Practice dashboard", icon: CalendarDays, action: () => onNavigate("admin"), active: currentView === "admin" },
              { label: "Growth workspace", icon: Megaphone, action: () => onNavigate("growth"), active: currentView === "growth" },
              ...(session.user.role === "superAdmin"
                ? [{ label: "System settings", icon: Settings, action: () => onNavigate("settings"), active: currentView === "settings" }]
                : []),
            ]),
      ]
    : [
        { label: "Home", icon: Home, action: () => onNavigate("home"), active: currentView === "home" },
        { label: "Our care", icon: HeartHandshake, section: "care", active: false },
        { label: "About", icon: Info, section: "about", active: false },
        { label: "Get updates", icon: MessageCircle, section: "updates", active: false },
        { label: "Staff sign in", icon: UserRound, action: () => onNavigate("admin"), active: currentView === "admin" },
      ];

  function closeOnMobile(action) {
    action();
    onCloseMobile();
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={onCloseMobile}
          type="button"
        />
      )}
      <aside
        aria-label="Sidebar navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-xl transition-all duration-200 md:translate-x-0 md:shadow-none ${
          expanded ? "w-72" : "w-20"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${expanded ? "justify-between px-4" : "justify-center px-2"}`}>
          <button
            aria-label={`${brand.name} home`}
            className={`flex min-w-0 items-center ${expanded ? "gap-3" : "justify-center"}`}
            onClick={() => closeOnMobile(() => onNavigate("home"))}
            type="button"
          >
            <BrandMark brand={brand} />
            {expanded && (
              <span className="min-w-0 text-left">
                <span className="block truncate font-display text-lg font-semibold leading-tight text-brand-900">
                  {brand.name}
                </span>
                <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  {brand.tagline}
                </span>
              </span>
            )}
          </button>
          <button
            aria-label={mobileOpen ? "Close sidebar" : expanded ? "Minimize sidebar" : "Expand sidebar"}
            className={`hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:inline-flex ${expanded ? "" : "absolute -right-3 top-6 z-10 border border-slate-200 bg-white shadow-sm"}`}
            onClick={onToggle}
            type="button"
          >
            {expanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
          </button>
          <button
            aria-label="Close sidebar"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={onCloseMobile}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {links.map(({ label, icon: Icon, action, section, active }) => (
            <button
              aria-current={active ? "page" : undefined}
              aria-label={!expanded ? label : undefined}
              className={`group flex w-full items-center rounded-xl py-3 text-sm font-medium transition ${
                expanded ? "gap-3 px-3" : "justify-center px-0"
              } ${
                active
                  ? "bg-brand-50 text-brand-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              key={label}
              onClick={() =>
                closeOnMobile(
                  section ? () => onSection(section) : action,
                )
              }
              title={!expanded ? label : undefined}
              type="button"
            >
              <Icon aria-hidden="true" className="shrink-0" size={19} />
              {expanded && <span className="truncate">{label}</span>}
            </button>
          ))}
          {!session && (
            <a
              aria-label={!expanded ? "Contact on WhatsApp" : undefined}
              className={`flex items-center rounded-xl py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 ${
                expanded ? "gap-3 px-3" : "justify-center px-0"
              }`}
              href="https://wa.me/2348132929712"
              rel="noreferrer"
              target="_blank"
              title={!expanded ? "Contact on WhatsApp" : undefined}
            >
              <MessageCircle aria-hidden="true" className="shrink-0" size={19} />
              {expanded && <span>Contact us</span>}
            </a>
          )}
        </nav>

        {session && (
          <div className="shrink-0 border-t border-slate-100 p-3">
            <button
              aria-label={!expanded ? "Sign out" : undefined}
              className={`flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
                expanded ? "gap-3 px-3" : "justify-center px-0"
              }`}
              onClick={() => closeOnMobile(onLogout)}
              title={!expanded ? "Sign out" : undefined}
              type="button"
            >
              <LogOut aria-hidden="true" className="shrink-0" size={19} />
              {expanded && <span>Sign out</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function BrandMark({ brand }) {
  return brand.logoDataUrl ? (
    <img
      alt=""
      className="h-11 w-11 shrink-0 rounded-xl object-contain"
      src={brand.logoDataUrl}
    />
  ) : (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
      <Heart fill="currentColor" size={21} />
    </span>
  );
}
