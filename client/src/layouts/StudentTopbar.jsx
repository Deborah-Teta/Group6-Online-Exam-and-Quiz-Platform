import { matchPath, useLocation } from "react-router-dom";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { studentNavigation, studentSubPages } from "./studentNavigation";

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function StudentTopbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const currentPage = [...studentNavigation, ...studentSubPages].find(
    ({ href }) => matchPath(href, pathname),
  );
  const pageLabel =
    typeof currentPage?.label === "function"
      ? currentPage.label(matchPath(currentPage.href, pathname).params)
      : currentPage?.label;

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between gap-[16px] border-b border-[#e3e4e8] bg-white px-[20px] sm:px-[40px]">
      <div className="flex items-center gap-[12px]">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-[8px] p-[4px] text-[#6d7180] hover:bg-[#f7f7f2] lg:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-[10px] text-[12px] leading-[1.55]">
          <span className="text-[#6d7180]">Student</span>
          <ChevronRight size={12} strokeWidth={1.6} className="text-[#6d7180]" />
          <span className="text-[#202536]">{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-[22px]">
        <p className="hidden text-[12px] leading-[1.55] text-[#6d7180] sm:block">
          {today}
        </p>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded text-[#6d7180] transition-colors hover:text-[#202536]"
        >
          <Bell size={18} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}

export default StudentTopbar;
