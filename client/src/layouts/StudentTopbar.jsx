import { matchPath, useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import {
  studentNavigation,
  studentSubPages,
  studentSupportNavigation,
} from "./studentNavigation";

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const allPages = [...studentNavigation, ...studentSupportNavigation, ...studentSubPages];

function StudentTopbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const currentPage = allPages.find(({ href }) => matchPath(href, pathname));

  return (
    <header className="sticky top-0 z-20 flex min-h-[64px] shrink-0 items-center justify-between gap-[16px] border-b border-line bg-card px-[16px] py-[10px] sm:px-[32px]">
      <div className="flex min-w-0 items-center gap-[12px]">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="shrink-0 cursor-pointer rounded-sm p-[4px] text-muted hover:bg-surface-hover lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="text-[18px] font-bold leading-[1.3] tracking-[-0.3px] text-main">
            {currentPage?.title ?? currentPage?.label}
          </p>
          <p className="hidden text-[12.5px] leading-normal text-muted sm:block">
            {currentPage?.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[12px]">
        <p className="hidden rounded-full bg-line-subtle px-[12px] py-[5px] text-[12px] font-semibold leading-normal text-muted sm:block">
          {today}
        </p>
        <button
          type="button"
          aria-label="Notifications"
          className="cursor-pointer rounded-sm border border-line bg-card p-[7px] text-main transition-colors duration-150 hover:bg-surface-hover"
        >
          <Bell size={14} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}

export default StudentTopbar;
