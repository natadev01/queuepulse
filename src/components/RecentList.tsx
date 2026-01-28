type RecentItem = {
  id: string;
  ticket_code: string;
  done_at: string | null;
};

const RecentList = ({ items }: { items: RecentItem[] }) => {
  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-md backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Recent Done
      </p>
      <ul className="mt-4 space-y-3">
        {items.length === 0 && (
          <li className="text-sm text-slate-500">No recent calls yet.</li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
          >
            <span className="font-semibold text-slate-700">
              {item.ticket_code}
            </span>
            <span className="text-xs text-slate-400">
              {item.done_at
                ? new Date(item.done_at).toLocaleTimeString()
                : "--"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentList;
