import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type QueueTicket = {
  id: string;
  ticket_code: string;
  status: "WAITING" | "SERVING" | "DONE";
  created_at: string;
  serving_at: string | null;
  done_at: string | null;
};

export const useRealtimeTicket = (ticketId?: string | null) => {
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    let mounted = true;
    setLoading(true);
    supabase
      .from("queue_tickets")
      .select("*")
      .eq("id", ticketId)
      .single()
      .then(({ data }) => {
        if (mounted) {
          setTicket(data as QueueTicket);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_tickets",
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          setTicket(payload.new as QueueTicket);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  return { ticket, loading };
};
