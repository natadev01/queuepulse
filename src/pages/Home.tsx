import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";

const Home = () => {
  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Client</h2>
          <p className="mt-2 text-sm text-slate-500">
            Generate a queue ticket and track its status in realtime.
          </p>
          <Link
            to="/client"
            className="mt-4 inline-flex rounded-full bg-amber-200 px-4 py-2 text-sm font-semibold text-amber-900"
          >
            Generate Ticket
          </Link>
        </div>
        <div className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Operator</h2>
          <p className="mt-2 text-sm text-slate-500">
            Scan QR tickets and advance their status.
          </p>
          <Link
            to="/operator"
            className="mt-4 inline-flex rounded-full bg-sky-200 px-4 py-2 text-sm font-semibold text-sky-900"
          >
            Open Scanner
          </Link>
        </div>
        <div className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-500">
            Monitor queue KPIs and realtime updates.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-900"
          >
            View Live Dashboard
          </Link>
        </div>
      </section>
    </AppShell>
  );
};

export default Home;
