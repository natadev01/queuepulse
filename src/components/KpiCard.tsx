type KpiCardProps = {
  label: string;
  value: string;
  helper?: string;
};

const KpiCard = ({ label, value, helper }: KpiCardProps) => {
  return (
    <div className="rounded-3xl bg-white/80 p-5 shadow-md backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
      {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
    </div>
  );
};

export default KpiCard;
