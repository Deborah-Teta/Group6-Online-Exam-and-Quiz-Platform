const variants = {
  open: "bg-[#eaf4ee] text-[#25715b]",
  upcoming: "bg-[#eeedf9] text-[#5149b8]",
  closed: "bg-[#f0f0ea] text-[#6d7180]",
};

function StatusBadge({ label, variant = "closed" }) {
  return (
    <span className={`inline-flex rounded-full px-[9px] py-[4px] text-[11px] leading-normal font-semibold whitespace-nowrap ${variants[variant]}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
