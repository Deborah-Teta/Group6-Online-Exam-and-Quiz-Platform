const variants = {
  info: "border-primary-border border-l-primary bg-primary-light text-primary-hover",
  warning:
    "border-[var(--color-warning-border)] border-l-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  neutral: "border-line border-l-subtle bg-page text-muted",
};

function Notice({ icon: Icon, title, children, variant = "info" }) {
  return (
    <div className={`flex items-start gap-[10px] rounded-sm border border-l-4 px-[14px] py-[12px] ${variants[variant]}`}>
      <Icon size={18} strokeWidth={1.6} className="mt-[1px] shrink-0" />
      <div className="flex min-w-0 flex-col gap-[2px] leading-normal">
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="text-[12.5px]">{children}</p>
      </div>
    </div>
  );
}

export default Notice;
