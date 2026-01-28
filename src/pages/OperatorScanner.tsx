import { useCallback, useRef, useState } from "react";
import AppShell from "../components/AppShell";
import QrScanner from "../components/QrScanner";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

type QueueTicket = {
  id: string;
  ticket_code: string;
  status: "WAITING" | "SERVING" | "DONE";
};

const COOLDOWN_MS = 2500;

const OperatorScanner = () => {
  const { user } = useAuth();
  const [statusMessage, setStatusMessage] = useState<string>("Ready to scan.");
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const lastScanRef = useRef<number>(0);
  const processingRef = useRef(false);

  const fetchTicket = useCallback(
    async (ticketId?: string | null, ticketCode?: string | null) => {
      if (!ticketId && !ticketCode) {
        throw new Error("Invalid QR payload.");
      }

      const query = supabase.from("queue_tickets").select("*");
      const { data, error } = ticketId
        ? await query.eq("id", ticketId).single()
        : await query.eq("ticket_code", ticketCode!).single();

      if (error || !data) {
        throw new Error("Ticket not found.");
      }
      return data as QueueTicket;
    },
    [],
  );

  const resolveTicket = useCallback(
    async (payload: string) => {
      let ticketId: string | null = null;
      let ticketCode: string | null = null;

      try {
        const parsed = JSON.parse(payload);
        ticketId = parsed.ticket_id ?? null;
        ticketCode = parsed.ticket_code ?? null;
      } catch {
        ticketCode = payload.startsWith("Q-") ? payload : null;
      }

      return await fetchTicket(ticketId, ticketCode);
    },
    [fetchTicket],
  );

  const advanceTicket = useCallback(
    async (ticket: QueueTicket) => {
      if (ticket.status === "WAITING") {
        const { data, error } = await supabase
          .from("queue_tickets")
          .update({
            status: "SERVING",
            serving_at: new Date().toISOString(),
            served_by: user?.id ?? null,
          })
          .eq("id", ticket.id)
          .eq("status", "WAITING")
          .select()
          .single();

        if (error || !data) {
          return { ticket: await fetchTicket(ticket.id, null), changed: false };
        }
        return { ticket: data as QueueTicket, changed: true };
      }

      if (ticket.status === "SERVING") {
        const { data, error } = await supabase
          .from("queue_tickets")
          .update({
            status: "DONE",
            done_at: new Date().toISOString(),
          })
          .eq("id", ticket.id)
          .eq("status", "SERVING")
          .select()
          .single();

        if (error || !data) {
          return { ticket: await fetchTicket(ticket.id, null), changed: false };
        }
        return { ticket: data as QueueTicket, changed: true };
      }

      return { ticket, changed: false };
    },
    [fetchTicket, user?.id],
  );

  const handleDecode = useCallback(
    async (text: string) => {
      const now = Date.now();
      if (now - lastScanRef.current < COOLDOWN_MS || processingRef.current) {
        return;
      }
      lastScanRef.current = now;
      processingRef.current = true;
      setProcessing(true);
      setStatusMessage("Processing ticket...");

      try {
        const ticket = await resolveTicket(text);
        const { ticket: updated, changed } = await advanceTicket(ticket);
        setActiveTicket(updated);
        if (updated.status === "DONE") {
          setStatusMessage("Ticket already completed.");
        } else if (changed) {
          setStatusMessage(`Ticket moved to ${updated.status}.`);
        } else {
          setStatusMessage(`No update. Current status: ${updated.status}.`);
        }
      } catch (err) {
        setStatusMessage((err as Error).message);
        setActiveTicket(null);
      } finally {
        setProcessing(false);
        processingRef.current = false;
      }
    },
    [advanceTicket, resolveTicket],
  );

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Operator Scanner
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Scan a client QR to advance status. WAITING → SERVING → DONE.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setScanActive((prev) => !prev)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {scanActive ? "Stop scanning" : "Start scanning"}
            </button>
            <span className="text-sm text-slate-500">
              Camera stays off until you start scanning.
            </span>
          </div>
          <div className="mt-4">
            {scanActive ? (
              <QrScanner
                onDecode={handleDecode}
                paused={!scanActive}
                preferRear
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
                Camera is off. Tap “Start scanning” to activate.
              </div>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {processing ? "Hold steady..." : statusMessage}
          </div>
        </section>

        <section className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Latest Scan
          </p>
          {activeTicket ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Ticket
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {activeTicket.ticket_code}
                </p>
              </div>
              <TicketStatusBadge status={activeTicket.status} />
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">
              No ticket scanned yet.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default OperatorScanner;
