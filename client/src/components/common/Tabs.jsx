// tabs: [{ label, value, icon, count }]. icon and count are optional.
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div role="tablist" className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
      {tabs.map(({ label, value, icon: Icon, count }) => {
        const isActive = value === activeTab;

        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? "bg-[#5149B8] text-white shadow-md"
                  : "bg-[#FFFFFF] text-[#5149B8] hover:bg-[#dbe7f9]"
              }
            `}
          >
            {Icon && <Icon size={16} />}
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[10px] font-black
                  ${isActive ? "bg-white/20 text-white" : "bg-white text-[#5149B8] shadow-xs"}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
