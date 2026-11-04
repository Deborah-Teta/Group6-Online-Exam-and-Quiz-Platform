import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export const ALL_CLASSES = "all";

const LIST_MAX_WIDTH = 240;

function ClassFilter({ classNames, value, onChange }) {
  const id = useId();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [opensRight, setOpensRight] = useState(false);

  const options = [
    { value: ALL_CLASSES, label: "All classes" },
    ...classNames.map((name) => ({ value: name, label: name })),
  ];
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const open = () => {
    setActiveIndex(selectedIndex);
    // Near the left edge of the screen, the list has to open towards the right.
    setOpensRight(containerRef.current.getBoundingClientRect().right < LIST_MAX_WIDTH);
    setIsOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    if (event.key === "Tab") {
      setIsOpen(false);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-[8px] text-[12px] leading-[1.55] text-[#6d7180]">
      <span id={`${id}-label`}>Class</span>

      <div ref={containerRef} className="relative">
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-list`}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={isOpen ? `${id}-option-${activeIndex}` : undefined}
          onClick={() => (isOpen ? setIsOpen(false) : open())}
          onKeyDown={handleKeyDown}
          className={`
            flex h-[34px] cursor-pointer items-center gap-[8px] rounded-[7px] border bg-white
            pl-[12px] pr-[10px] text-[12px] font-semibold whitespace-nowrap text-[#202536]
            outline-none transition-colors hover:bg-[#f7f7f2] focus-visible:border-[#5149b8]
            ${isOpen ? "border-[#5149b8]" : "border-[#e3e4e8]"}
          `}
        >
          {options[selectedIndex].label}
          <ChevronDown
            size={14}
            strokeWidth={1.6}
            className={`shrink-0 text-[#6d7180] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className={`absolute ${opensRight ? "left-0" : "right-0"} top-full z-30 mt-[6px] flex w-max min-w-full flex-col gap-[2px] rounded-[10px] border border-[#e3e4e8] bg-white p-[6px] text-left shadow-[0px_16px_64px_0px_rgba(32,37,54,0.13)]`}
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;

              return (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option)}
                  onPointerEnter={() => setActiveIndex(index)}
                  className={`
                    flex h-[34px] cursor-pointer items-center justify-between gap-[16px] rounded-[7px]
                    px-[10px] text-[12px] whitespace-nowrap transition-colors
                    ${isSelected ? "font-semibold text-[#5149b8]" : "text-[#202536]"}
                    ${index === activeIndex ? "bg-[#eeedf9]" : ""}
                  `}
                >
                  {option.label}
                  <Check
                    size={14}
                    strokeWidth={1.6}
                    className={`shrink-0 ${isSelected ? "" : "invisible"}`}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ClassFilter;
