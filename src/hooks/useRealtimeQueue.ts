import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type QueueTicketLite = {
  id: string;
  ticket_code: string;
  created_at: string;
  serving_at: string | null;
  done_at: string | null;
};

export type DashboardData = {
  waitingCount: number;
  nowServing: QueueTicketLite | null;
  avgWaitMinutes: number | null;
  recentCalls: QueueTicketLite[];
  queuePreview: QueueTicketLite[];
};

const calculateAverageWait = (rows: QueueTicketLite[]) => {
  if (!rows.length) return null;
  const totalMs = rows.reduce((acc, row) => {
    if (!row.serving_at) return acc;
    return acc + (new Date(row.serving_at).getTime() - new Date(row.created_at).getTime());
  }, 0);
  return Math.round(totalMs / rows.length / 60000);
};

export const useRealtimeQueue = () => {
  const [data, setData] = useState<DashboardData>({
    waitingCount: 0,
    nowServing: null,
    avgWaitMinutes: null,
    recentCalls: [],
    queuePreview: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRealtime = false) => {
    if (isRealtime) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    const [{ count: waitingCount }, { data: nowServing }, { data: avgRows }, { data: recentCalls }, { data: queuePreview }] =
      await Promise.all([
        supabase
          .from("queue_tickets")
          .select("id", { count: "exact", head: true })
          .eq("status", "WAITING"),
        supabase
          .from("queue_tickets")
          .select("id, ticket_code, created_at, serving_at, done_at")
          .eq("status", "SERVING")
          .order("serving_at", { ascending: false })
          .limit(1),
        supabase
          .from("queue_tickets")
          .select("id, ticket_code, created_at, serving_at, done_at")
          .not("serving_at", "is", null),
        supabase
          .from("queue_tickets")
          .select("id, ticket_code, created_at, serving_at, done_at")
          .eq("status", "DONE")
          .order("done_at", { ascending: false })
          .limit(10),
        supabase
          .from("queue_tickets")
          .select("id, ticket_code, created_at, serving_at, done_at")
          .eq("status", "WAITING")
          .order("created_at", { ascending: true })
          .limit(10),
      ]);

    const avgWaitMinutes = calculateAverageWait(avgRows ?? []);
    setData({
      waitingCount: waitingCount ?? 0,
      nowServing: nowServing?.[0] ?? null,
      avgWaitMinutes,
      recentCalls: recentCalls ?? [],
      queuePreview: queuePreview ?? [],
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboard(false);
    const channel = supabase
      .channel("queuepulse-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_tickets" },
        () => {
          fetchDashboard(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboard]);

  return {
    data,
    loading,
    refreshing,
    refresh: () => fetchDashboard(true),
  };
};
