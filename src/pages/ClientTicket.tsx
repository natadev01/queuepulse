import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import QrCodeView from "../components/QrCodeView";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useRealtimeTicket } from "../hooks/useRealtimeTicket";

const STORAGE_KEY = "queuepulse_ticket";

type StoredTicket = {
  id: string;
  ticket_code: string;
};

const ClientTicket = () => {
  const { user } = useAuth();
  const [storedTicket, setStoredTicket] = useState<StoredTicket | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ticket } = useRealtimeTicket(storedTicket?.id);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setStoredTicket(JSON.parse(raw) as StoredTicket);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_queue_ticket", {
      p_user_id: user?.id ?? null,
    });
    if (rpcError || !data) {
      setError(rpcError?.message ?? "Unable to create ticket.");
      setCreating(false);
      return;
    }
    const newTicket = data as StoredTicket;
    setStoredTicket(newTicket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTicket));
    setCreating(false);
  };

  const status = ticket?.status ?? "WAITING";
  const qrPayload = useMemo(() => {
    if (!storedTicket) return "";
    return JSON.stringify({
      ticket_id: storedTicket.id,
      ticket_code: storedTicket.ticket_code,
    });
  }, [storedTicket]);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Generate your QR ticket
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Each ticket is tracked live via Supabase Realtime. Keep this open to
            see status updates instantly.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Generate My Ticket"}
            </button>
            {storedTicket && (
              <button
                onClick={() => {
                  setStoredTicket(null);
                  localStorage.removeItem(STORAGE_KEY);
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400"
              >
                Clear Ticket
              </button>
            )}
          </div>
          {error && (
            <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          {storedTicket && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Ticket Code
                  </p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {storedTicket.ticket_code}
                  </p>
                </div>
                <TicketStatusBadge status={status} />
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Status updates automatically when an operator scans your QR.
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col items-center gap-4 rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            QR Ticket
          </p>
          {storedTicket ? (
            <QrCodeView value={qrPayload} />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400">
              Generate a ticket to get started.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default ClientTicket;
