function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div role="tablist" className="flex shrink-0 overflow-x-auto border-b border-line bg-surface-subtle px-[16px]">
      {tabs.map(({ label, value }) => {
        const isActive = value === activeTab;

        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={`
              -mb-px shrink-0 cursor-pointer border-b-2 px-[18px] py-[14px]
              text-[13.5px] font-semibold leading-normal whitespace-nowrap transition-colors duration-150
              ${
                isActive
                  ? "border-primary bg-card text-primary"
                  : "border-transparent text-muted hover:bg-black/[0.02] hover:text-main"
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
