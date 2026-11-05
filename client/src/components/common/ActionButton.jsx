const variants = {
  primary: "bg-[#5149B8] text-white shadow-xs",
  secondary: "border border-slate-200 bg-white text-slate-600",
};

const hovers = {
  primary: "hover:bg-[#413B9A]",
  secondary: "hover:bg-slate-50",
};

// The small buttons used in the admin dashboard's tables and dialogs.
function ActionButton({
  label,
  type = "button",
  onClick,
  disabled = false,
  icon,
  variant = "primary",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5
        text-xs font-bold whitespace-nowrap transition
        ${variants[variant]}
        ${disabled ? "cursor-not-allowed opacity-50" : `cursor-pointer ${hovers[variant]}`}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

export default ActionButton;
