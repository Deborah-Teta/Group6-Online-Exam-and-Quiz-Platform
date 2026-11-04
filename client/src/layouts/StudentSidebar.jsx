import { NavLink } from "react-router-dom";
import { BookOpen, LogOut, X } from "lucide-react";
import { studentNavigation, studentSupportNavigation } from "./studentNavigation";

function SectionTitle({ children }) {
  return (
    <p className="px-[12px] pb-[6px] pt-[10px] text-[11px] font-bold uppercase tracking-[0.8px] text-subtle">
      {children}
    </p>
  );
}

function SidebarLink({ label, icon: Icon, href, onClick }) {
  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-[12px] rounded-sm px-[14px] py-[10px]
        text-[13.5px] leading-normal transition-colors duration-150
        ${
          isActive
            ? "bg-primary-light font-semibold text-primary"
            : "font-medium text-muted hover:bg-surface-hover hover:text-main"
        }
      `}
    >
      <Icon size={18} strokeWidth={1.6} className="shrink-0" />
      {label}
    </NavLink>
  );
}

function StudentSidebar({ student, isOpen = false, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.5)] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] shrink-0 flex-col
          border-r border-line bg-card shadow-[1px_0_3px_rgba(0,0,0,0.02)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-[12px] border-b border-line px-[20px] pb-[18px] pt-[20px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex size-[38px] shrink-0 items-center justify-center rounded-md bg-linear-to-br from-brand-start to-primary text-white shadow-[0_4px_10px_rgba(79,70,229,0.3)]">
              <BookOpen size={20} strokeWidth={1.6} />
            </div>
            <div className="flex flex-col">
              <p className="text-[16px] font-bold leading-[1.2] tracking-[-0.3px] text-main">EduExam</p>
              <p className="text-[11px] font-semibold uppercase leading-normal tracking-[0.6px] text-primary">
                Student Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="cursor-pointer rounded-sm p-[4px] text-muted hover:bg-surface-hover lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-[4px] overflow-y-auto px-[12px] py-[18px]">
          <SectionTitle>Learning</SectionTitle>
          {studentNavigation.map(({ label, icon, href }) => (
            <SidebarLink key={href} label={label} icon={icon} href={href} onClick={onClose} />
          ))}

          <SectionTitle>Support</SectionTitle>
          {studentSupportNavigation.map(({ label, icon, href }) => (
            <SidebarLink key={href} label={label} icon={icon} href={href} onClick={onClose} />
          ))}
        </nav>

        {/* Account */}
        <div className="flex flex-col gap-[12px] border-t border-line bg-surface-subtle p-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-start to-primary text-[13px] font-bold text-white">
              {student.initials}
            </div>

            <div className="flex min-w-0 flex-col">
              <p className="truncate text-[13px] font-semibold leading-normal text-main">{student.name}</p>
              <p className="truncate text-[11.5px] leading-normal text-muted">
                {student.role} · {student.school}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-sm border border-line bg-card px-[12px] py-[8px] text-[12.5px] font-medium leading-normal text-muted transition-colors duration-150 hover:border-[var(--color-danger-border)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)]"
          >
            <LogOut size={14} strokeWidth={1.6} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default StudentSidebar;
