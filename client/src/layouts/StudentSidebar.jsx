import { NavLink } from "react-router-dom";
import { BookOpen, CircleHelp, LogOut, X } from "lucide-react";
import { studentNavigation } from "./studentNavigation";

function StudentSidebar({ student, isOpen = false, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-[232px] shrink-0 flex-col gap-[30px]
          overflow-y-auto border-r border-[#e3e4e8] bg-white px-[20px] pb-[24px] pt-[30px]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <div className="flex size-[33px] items-center justify-center rounded-[8px] bg-[#5149b8]">
              <BookOpen size={19} strokeWidth={1.8} className="text-white" />
            </div>
            <p className="text-[23px] font-bold leading-normal text-[#202536]">examly</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-[8px] p-[4px] text-[#6d7180] hover:bg-[#f7f7f2] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex flex-col gap-[7px] rounded-[7px] bg-[#f7f7f2] p-[12px]">
          <p className="text-[10px] font-semibold uppercase leading-[1.55] text-[#6d7180]">
            {student.school}
          </p>
          <div className="flex items-center gap-[8px]">
            <span className="size-[6px] rounded-[3px] bg-[#397763]" />
            <p className="text-[12px] font-semibold leading-[1.55] text-[#202536]">
              Student workspace
            </p>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex flex-col gap-[6px]">
          {studentNavigation.map(({ label, icon: Icon, href }) => (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              className={({ isActive }) => `
                flex h-[44px] items-center gap-[12px] rounded-[7px] px-[12px]
                text-[13px] leading-[1.55] transition-colors
                ${
                  isActive
                    ? "bg-[#eeedf9] font-semibold text-[#5149b8]"
                    : "font-normal text-[#6d7180] hover:bg-[#f7f7f2]"
                }
              `}
            >
              <Icon size={18} strokeWidth={1.6} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Support and account */}
        <div className="mt-auto flex flex-col gap-[16px] pt-[30px]">
          <button
            type="button"
            className="flex items-start gap-[10px] rounded-[7px] p-[10px] text-left text-[12px] leading-[1.55] text-[#6d7180] transition-colors hover:bg-[#f7f7f2]"
          >
            <CircleHelp size={18} strokeWidth={1.6} className="shrink-0" />
            Help &amp; guidelines
          </button>

          <div className="h-px bg-[#e3e4e8]" />

          <div className="flex items-center gap-[10px]">
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#f0f0ea] text-[11px] font-semibold text-[#202536]">
              {student.initials}
            </div>

            <div className="min-w-0 flex-1 leading-[1.55]">
              <p className="text-[11px] font-semibold text-[#202536]">
                {student.name}
              </p>
              <p className="text-[10px] text-[#6d7180]">{student.role}</p>
            </div>

            <button
              type="button"
              aria-label="Log out"
              className="shrink-0 rounded text-[#6d7180] transition-colors hover:text-[#202536]"
            >
              <LogOut size={15} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default StudentSidebar;
