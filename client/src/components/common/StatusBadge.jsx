const variants = {
  open: "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
  upcoming: "border-primary-border bg-primary-light text-primary",
  closed: "border-slate-300 bg-surface-hover text-slate-700",
};

function StatusBadge({ label, variant = "closed" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-[8px] py-[2px] text-[11px] font-semibold leading-normal whitespace-nowrap ${variants[variant]}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
