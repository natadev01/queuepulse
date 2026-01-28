import AppShell from "../components/AppShell";
import KpiCard from "../components/KpiCard";
import QueueList from "../components/QueueList";
import RecentList from "../components/RecentList";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { useRealtimeQueue } from "../hooks/useRealtimeQueue";

const LiveDashboard = () => {
  const { data, loading, refreshing, refresh } = useRealtimeQueue();

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Live Queue Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Realtime KPIs update instantly across devices.
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 rounded-3xl bg-white/80 px-6 py-4 shadow-md">
          Loading realtime metrics...
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <KpiCard
              label="Waiting Count"
              value={data.waitingCount.toString()}
              helper="Tickets in queue"
            />
            <KpiCard
              label="Now Serving"
              value={data.nowServing?.ticket_code ?? "--"}
              helper={data.nowServing ? "Active ticket" : "No active service"}
            />
            <KpiCard
              label="Avg Wait (served)"
              value={
                data.avgWaitMinutes !== null
                  ? data.avgWaitMinutes.toString()
                  : "--"
              }
              helper={
                data.avgWaitMinutes !== null
                  ? "Avg minutes from ticket creation to first call"
                  : "No served tickets yet"
              }
            />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <QueueList items={data.queuePreview} />
            <RecentList items={data.recentCalls} />
          </section>

          <section className="mt-6 rounded-3xl bg-white/80 p-6 shadow-md">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Now Serving Details
            </p>
            {data.nowServing ? (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Ticket
                  </div>
                  <div className="text-xl font-semibold text-slate-900">
                    {data.nowServing.ticket_code}
                  </div>
                </div>
                <TicketStatusBadge status="SERVING" />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No ticket is currently being served.
              </p>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
};

export default LiveDashboard;
