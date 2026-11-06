import { useEffect, useRef, useState } from "react";

const PADDING = { top: 20, right: 48, bottom: 32, left: 48 };
const MIN_LABEL_SPACING = 60;

// data: [{ label, value, detail }]. Single-series line chart with hover and keyboard readout.
function LineChart({ data = [], label, max = 100, height = 240, formatValue = (value) => value }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry?.contentRect) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
        No released scores to plot yet.
      </div>
    );
  }

  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const isSingle = data.length <= 1;
  const step = isSingle ? 0 : plotWidth / Math.max(data.length - 1, 1);
  const baseline = PADDING.top + plotHeight;

  const getX = (index) => {
    if (isSingle) return PADDING.left + plotWidth / 2;
    return PADDING.left + index * step;
  };

  const getY = (value) => PADDING.top + (1 - Math.min(Math.max(value, 0), max) / max) * plotHeight;

  const linePath = isSingle
    ? ""
    : data
        .map(({ value }, index) => `${index === 0 ? "M" : "L"}${getX(index)},${getY(value)}`)
        .join(" ");

  const areaPath = isSingle
    ? ""
    : `${linePath} L${getX(data.length - 1)},${baseline} L${getX(0)},${baseline} Z`;

  const ticks = [0, 25, 50, 75, 100];
  const labelEvery = isSingle ? 1 : Math.max(Math.ceil(MIN_LABEL_SPACING / (step || 1)), 1);
  const active = activeIndex === null ? null : data[activeIndex];

  const handlePointerMove = (event) => {
    if (!containerRef.current || isSingle) {
      setActiveIndex(0);
      return;
    }
    const { left } = containerRef.current.getBoundingClientRect();
    const index = Math.round((event.clientX - left - PADDING.left) / (step || 1));
    setActiveIndex(Math.min(Math.max(index, 0), data.length - 1));
  };

  const handleKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const change = event.key === "ArrowRight" ? 1 : -1;
    setActiveIndex((current) =>
      Math.min(Math.max((current ?? data.length - 1) + change, 0), data.length - 1),
    );
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`${label}. Current score: ${formatValue(data[data.length - 1].value)}`}
      tabIndex={0}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActiveIndex(null)}
      onFocus={() => setActiveIndex(data.length - 1)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={handleKeyDown}
      style={{ height }}
      className="relative w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#5149B8]"
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden="true" className="block select-none overflow-visible">
          {/* Y Axis Grid lines and percentage labels */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={getY(tick)}
                y2={getY(tick)}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 10}
                y={getY(tick) + 4}
                textAnchor="end"
                className="fill-slate-400 text-[11px] font-medium tabular-nums"
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill="#5149B8" fillOpacity={0.08} />
          )}

          {/* Line stroke */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#5149B8"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Active hover crosshair */}
          {active && (
            <line
              x1={getX(activeIndex)}
              x2={getX(activeIndex)}
              y1={PADDING.top}
              y2={baseline}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
          )}

          {/* Data points */}
          {data.map((point, index) => {
            const cx = getX(index);
            const cy = getY(point.value);
            const isHovered = index === activeIndex;

            return (
              <g key={point.label + index}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4.5}
                  fill="#5149B8"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  className="transition-all duration-150"
                />

                {/* Always show latest score near last point */}
                {index === data.length - 1 && !active && (
                  <text
                    x={isSingle ? cx : cx + 12}
                    y={isSingle ? cy - 12 : cy + 4}
                    textAnchor={isSingle ? "middle" : "start"}
                    className="fill-slate-900 text-xs font-bold"
                  >
                    {formatValue(point.value)}
                  </text>
                )}

                {/* X Axis Date labels */}
                {(index % labelEvery === (data.length - 1) % labelEvery || isSingle) && (
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-slate-400 text-[11px] font-medium"
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* Floating tooltip */}
      {active && (
        <div
          style={{
            left: Math.min(Math.max(getX(activeIndex), 85), width - 85),
            top: Math.max(getY(active.value) - 64, 4),
          }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-lg"
        >
          <p className="text-xs font-bold text-slate-900">
            {formatValue(active.value)}
          </p>
          <p className="truncate text-[11px] text-slate-500">
            {active.detail} · {active.label}
          </p>
        </div>
      )}
    </div>
  );
}

export default LineChart;
