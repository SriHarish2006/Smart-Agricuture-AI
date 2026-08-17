import { NavLink, Outlet } from "react-router-dom";
import { Sprout, CloudSun, Leaf, MessageCircleQuestion, History, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Sprout, end: true },
  { to: "/weather", label: "Weather Analysis", icon: CloudSun },
  { to: "/disease", label: "Leaf Disease Detection", icon: Leaf },
  { to: "/chatbot", label: "Agriculture Chatbot", icon: MessageCircleQuestion },
  { to: "/history", label: "History", icon: History },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-canopy-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-canopy-600 text-cream flex items-center justify-center">
              <Sprout size={20} />
            </div>
            <div>
              <p className="font-display font-semibold text-lg leading-none text-canopy-900">AI Smart Agriculture</p>
              <p className="text-[11px] text-canopy-700 hidden sm:block">Weather · Disease Detection · Guidance</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive ? "bg-canopy-600 text-cream" : "text-canopy-800 hover:bg-canopy-100"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-canopy-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-canopy-200 bg-cream px-4 py-2 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? "bg-canopy-600 text-cream" : "text-canopy-800 hover:bg-canopy-100"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-canopy-200 py-6 text-center text-xs text-canopy-700">
        AI Smart Agriculture · Built for farmers as a final-year engineering project
      </footer>
    </div>
  );
}
