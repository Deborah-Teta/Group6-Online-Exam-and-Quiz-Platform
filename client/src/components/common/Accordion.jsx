import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

// items: [{ id, title, content }]. One item is open at a time.
function Accordion({ items, emptyMessage = "Nothing to show." }) {
  const baseId = useId();
  const [openId, setOpenId] = useState(items[0]?.id ?? null);

  if (items.length === 0) {
    return (
      <p className="py-[24px] text-center text-[13px] leading-[1.55] text-[#6d7180]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map(({ id, title, content }) => {
        const isOpen = id === openId;
        const panelId = `${baseId}-${id}`;

        return (
          <div key={id} className="border-b border-[#e3e4e8] last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : id)}
              className="flex w-full cursor-pointer items-center justify-between gap-[16px] rounded-[7px] py-[14px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#5149b8]"
            >
              <span className={`text-[14px] leading-[1.55] ${isOpen ? "font-semibold text-[#5149b8]" : "font-semibold text-[#202536]"}`}>
                {title}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={1.6}
                className={`shrink-0 text-[#6d7180] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div id={panelId} className="pb-[16px] pr-[32px] text-[13px] leading-[1.55] text-[#6d7180]">
                {content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
