import Card from "./Card";

function SectionCard({ title, action, children, className = "" }) {
  return (
    <Card className={`flex min-w-0 flex-col gap-[20px] p-[24px] ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[4px]">
        <p className="text-[17px] font-semibold leading-normal text-[#202536]">{title}</p>
        {action && <div className="text-[12px] leading-[1.55] text-[#6d7180]">{action}</div>}
      </div>
      {children}
    </Card>
  );
}

export default SectionCard;
