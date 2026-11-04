import Card from "./Card";

// flush removes the body padding, so tabs and tables can reach the card's edges.
function SectionCard({ title, action, children, flush = false, className = "" }) {
  return (
    <Card className={`flex min-w-0 flex-col ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[6px] border-b border-line-subtle px-[20px] py-[16px]">
        <p className="text-[15px] font-bold leading-normal text-main">{title}</p>
        {action && <div className="text-[12.5px] leading-normal text-muted">{action}</div>}
      </div>

      <div
        className={
          flush
            ? "flex flex-1 flex-col overflow-hidden rounded-b-md"
            : "flex flex-1 flex-col gap-[20px] p-[20px]"
        }
      >
        {children}
      </div>
    </Card>
  );
}

export default SectionCard;
