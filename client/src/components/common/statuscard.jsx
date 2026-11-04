import Card from "./Card";

const iconColors = {
  indigo: "bg-primary-light text-primary",
  emerald: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-violet-50 text-violet-600",
};

const StatCard = ({ icon, color = "indigo", title, value, subtext }) => {
  return (
    <Card className="flex items-center justify-between gap-[12px] px-[20px] py-[18px] transition-[transform,box-shadow] duration-150 hover:-translate-y-[2px] hover:shadow-sm">
      <div className="flex min-w-0 flex-col">
        <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-muted">{title}</p>
        <p className="mb-[2px] mt-[4px] text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-main">
          {value}
        </p>
        <p className="text-[12px] leading-normal text-muted">{subtext}</p>
      </div>

      {icon && (
        <div className={`flex size-[44px] shrink-0 items-center justify-center rounded-md ${iconColors[color]}`}>
          {icon}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
