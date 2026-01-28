type QueueItem = {
  id: string;
  ticket_code: string;
  created_at: string;
};

const QueueList = ({ items }: { items: QueueItem[] }) => {
  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-md backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Next Waiting
      </p>
      <ul className="mt-4 space-y-3">
        {items.length === 0 && (
          <li className="text-sm text-slate-500">Queue is empty.</li>
        )}
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
          >
            <span className="font-semibold text-slate-700">
              {index + 1}. {item.ticket_code}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(item.created_at).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueueList;
