import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Client", path: "/client" },
  { label: "Operator", path: "/operator" },
  { label: "Dashboard", path: "/dashboard" },
];

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/80 px-5 py-4 shadow-lg backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              QueuePulse
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Realtime Queue Manager
            </h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden max-w-[220px] truncate sm:inline">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="px-6 pb-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
