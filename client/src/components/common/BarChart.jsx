// data: [{ label, value, detail }]. Horizontal bars with the value at each bar's tip.
function BarChart({ data, label, max = 100, formatValue = (value) => value }) {
  return (
    <ul aria-label={label} className="flex flex-1 flex-col justify-center gap-[24px]">
      {data.map((item) => (
        <li key={item.label} tabIndex={0} className="group relative rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <div className="mb-[8px] flex items-baseline justify-between gap-[8px]">
            <span className="text-[13px] leading-[1.55] text-main">{item.label}</span>
            <span className="text-[11px] leading-[1.55] text-muted">{item.detail}</span>
          </div>

          <div className="flex items-center gap-[8px] border-l border-muted">
            <div className="min-w-0 flex-1">
              <div
                style={{ width: `${(item.value / max) * 100}%` }}
                className="h-[24px] rounded-r-[4px] bg-primary transition-opacity group-hover:opacity-85"
              />
            </div>
            <span className="w-[36px] shrink-0 text-right text-[12px] font-semibold leading-[1.55] text-main">
              {formatValue(item.value)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BarChart;
