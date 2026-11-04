function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div role="tablist" className="flex gap-[24px] overflow-x-auto border-b border-[#e3e4e8]">
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
              shrink-0 cursor-pointer border-b-2 pb-[14px] pt-[6px]
              text-[13px] font-semibold leading-[1.55] whitespace-nowrap transition-colors
              ${
                isActive
                  ? "border-[#5149b8] text-[#5149b8]"
                  : "border-transparent text-[#6d7180] hover:text-[#202536]"
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
