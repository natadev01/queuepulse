type TicketStatus = "WAITING" | "SERVING" | "DONE";

const statusStyles: Record<TicketStatus, string> = {
  WAITING: "bg-amber-100 text-amber-700 border-amber-200",
  SERVING: "bg-sky-100 text-sky-700 border-sky-200",
  DONE: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TicketStatusBadge = ({ status }: { status: TicketStatus }) => {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default TicketStatusBadge;
