const variants = {
  info: {
    box: "border-[#dbe7f9] bg-[#EEF3FD]",
    icon: "text-[#0B609D]",
    text: "text-[#0B609D]",
  },
  warning: {
    box: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
    text: "text-amber-900",
  },
  neutral: {
    box: "border-slate-100 bg-slate-50",
    icon: "text-slate-500",
    text: "text-slate-600",
  },
};

function Notice({ icon: Icon, title, children, variant = "info" }) {
  const { box, icon, text } = variants[variant];

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xs ${box}`}>
      <Icon size={20} className={`shrink-0 ${icon}`} />
      <div className={`flex min-w-0 flex-col gap-1 ${text}`}>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs">{children}</p>
      </div>
    </div>
  );
}

export default Notice;
