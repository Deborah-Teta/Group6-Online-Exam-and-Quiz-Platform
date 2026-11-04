const variants = {
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-slate-50 text-slate-500 border-slate-200",
};

function StatusBadge({ label, variant = "closed" }) {
  return (
    <span className={`inline-block border px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap ${variants[variant]}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
