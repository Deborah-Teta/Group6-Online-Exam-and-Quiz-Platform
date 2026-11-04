import { useEffect, useRef, useState } from "react";

const HEIGHT = 240;
const PADDING = { top: 16, right: 40, bottom: 28, left: 34 };
const MIN_LABEL_SPACING = 56;

// data: [{ label, value, detail }]. Single-series line chart with hover and keyboard readout.
function LineChart({ data, label, max = 100, formatValue = (value) => value }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 0);
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const step = plotWidth / Math.max(data.length - 1, 1);
  const baseline = PADDING.top + plotHeight;

  const getX = (index) => PADDING.left + index * step;
  const getY = (value) => PADDING.top + (1 - value / max) * plotHeight;

  const linePath = data
    .map(({ value }, index) => `${index === 0 ? "M" : "L"}${getX(index)},${getY(value)}`)
    .join(" ");
  const areaPath = `${linePath} L${getX(data.length - 1)},${baseline} L${getX(0)},${baseline} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * max);
  const labelEvery = Math.max(Math.ceil(MIN_LABEL_SPACING / (step || 1)), 1);
  const active = activeIndex === null ? null : data[activeIndex];

  const handlePointerMove = (event) => {
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
    <>
      <div
        ref={containerRef}
        role="img"
        aria-label={label}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex(data.length - 1)}
        onBlur={() => setActiveIndex(null)}
        onKeyDown={handleKeyDown}
        style={{ height: HEIGHT }}
        className="relative w-full rounded-[7px] outline-none focus-visible:ring-2 focus-visible:ring-[#5149b8]"
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden="true" className="block">
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={width - PADDING.right}
                  y1={getY(tick)}
                  y2={getY(tick)}
                  stroke="#e3e4e8"
                />
                <text
                  x={PADDING.left - 8}
                  y={getY(tick) + 4}
                  textAnchor="end"
                  className="fill-[#6d7180] text-[11px] tabular-nums"
                >
                  {tick}
                </text>
              </g>
            ))}

            {data.map((point, index) =>
              index % labelEvery === (data.length - 1) % labelEvery ? (
                <text
                  key={point.label}
                  x={getX(index)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-[#6d7180] text-[11px]"
                >
                  {point.label}
                </text>
              ) : null,
            )}

            <path d={areaPath} fill="#5149b8" fillOpacity={0.1} />
            <path
              d={linePath}
              fill="none"
              stroke="#5149b8"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {active && (
              <line
                x1={getX(activeIndex)}
                x2={getX(activeIndex)}
                y1={PADDING.top}
                y2={baseline}
                stroke="#6d7180"
              />
            )}

            {data.map((point, index) => (
              <circle
                key={point.label}
                cx={getX(index)}
                cy={getY(point.value)}
                r={index === activeIndex ? 5 : 4}
                fill="#5149b8"
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}

            <text
              x={getX(data.length - 1) + 10}
              y={getY(data[data.length - 1].value) + 4}
              className="fill-[#202536] text-[12px] font-semibold"
            >
              {formatValue(data[data.length - 1].value)}
            </text>
          </svg>
        )}

        {active && (
          <div
            style={{
              left: Math.min(Math.max(getX(activeIndex), 80), width - 80),
              top: Math.max(getY(active.value) - 72, 0),
            }}
            className="pointer-events-none absolute w-[150px] -translate-x-1/2 rounded-[7px] border border-[#e3e4e8] bg-white px-[10px] py-[6px] text-left shadow-sm"
          >
            <p className="text-[13px] font-semibold leading-[1.55] text-[#202536]">
              {formatValue(active.value)}
            </p>
            <p className="truncate text-[11px] leading-[1.55] text-[#6d7180]">
              {active.detail} · {active.label}
            </p>
          </div>
        )}
      </div>

      {/* Table view for screen readers */}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.detail}, {point.label}</th>
              <td>{formatValue(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default LineChart;
