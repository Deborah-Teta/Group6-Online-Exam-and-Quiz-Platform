import Card from "./Card";

function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <Card className={`flex min-w-0 flex-col gap-6 p-6 sm:p-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        {action && <div className="text-xs text-slate-500">{action}</div>}
      </div>
      {children}
    </Card>
  );
}

export default SectionCard;
