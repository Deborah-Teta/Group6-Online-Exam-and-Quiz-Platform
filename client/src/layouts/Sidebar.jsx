import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  FileQuestion,
  Sparkles,
  ClipboardList,
  BarChart3,
  CircleHelp,
  GraduationCap,
  ListChecks,
  Shield,
  Settings,
  X,
} from "lucide-react";

const navigationByRole = {
  teacher: [
    { label: "Overview", icon: Home, href: "/teacher/dashboard" },
    { label: "My Classes", icon: GraduationCap, href: "/teacher/classes" },
    { label: "Question Bank", icon: BookOpen, href: "/teacher/questions" },
    { label: "AI Generator", icon: Sparkles, href: "/teacher/ai-generator" },
    { label: "Exams", icon: ClipboardList, href: "/teacher/exams" },
    { label: "Results", icon: BarChart3, href: "/teacher/results" },
  ],

  student: [
    { label: "Overview", icon: Home, href: "/student/dashboard" },
    { label: "My Classes", icon: GraduationCap, href: "/student/classes" },
    { label: "My Exams", icon: FileQuestion, href: "/student/exams" },
    { label: "My Quizzes", icon: ListChecks, href: "/student/quizzes" },
    { label: "My Results", icon: BarChart3, href: "/student/results" },
  ],

  admin: [
    { label: "Overview", icon: Home, href: "/admin/dashboard" },
    { label: "Teacher Approvals", icon: Users, href: "/admin/approvals" },
    { label: "Manage Users", icon: Users, href: "/admin/users" },
    { label: "Manage Classes", icon: GraduationCap, href: "/admin/classes" },
    { label: "Audit Logs", icon: Shield, href: "/admin/audit" },
  ],
};

const settingsItem = { label: "Settings", icon: Settings };

const footerItemsByRole = {
  admin: [{ ...settingsItem, href: "/admin/settings" }],
  student: [
    { label: "Help", icon: CircleHelp, href: "/student/help" },
    { ...settingsItem, href: "/student/settings" },
  ],
};

function Sidebar({ role, isOpen = false, onClose }) {
  const navigation = navigationByRole[role] || [];
  const footerItems = footerItemsByRole[role] || footerItemsByRole.admin;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed rounded-3xl left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-auto [scrollbar-width:none]
          bg-[#EEF3FD] px-4 py-6 shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:inset-y-0 md:left-0 md:h-screen md:w-28
          md:translate-x-0 md:items-center
          md:px-2 md:py-5
          md:shadow-[8px_0_32px_rgba(0,0,0,0.12)]
        `}
      >
        {/* Mobile branding */}
        <div className="mb-7 flex items-center justify-between md:hidden">
          <h2 className="text-xl font-bold text-[#0B609D]">
            Exam<span className="text-slate-700">Flow</span>
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#0B609D] hover:bg-white/70"
          >
            <X size={22} />
          </button>
        </div>

        {/* Desktop logo */}
        <div className="mb-8 hidden md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B609D] text-white shadow-md">
            <GraduationCap size={25} />
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex flex-1 flex-col gap-2 md:w-full md:items-center md:gap-4">
          {navigation.map(({ label, icon: Icon, href }) => (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              title={label}
              aria-label={label}
              className={({ isActive }) => `
                group flex items-center gap-4 rounded-xl px-4 py-3
                transition-all duration-200
                md:w-full md:flex-col md:gap-1 md:rounded-none
                md:px-0 md:py-0

                ${
                  isActive
                    ? "bg-white/70 text-[#0B609D] md:bg-transparent"
                    : "text-[#0B609D] hover:bg-white/60 md:hover:bg-transparent"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                      flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-full transition-all duration-200
                      md:h-12 md:w-12
                      ${
                        isActive
                          ? "bg-[#0B609D] text-white shadow-md"
                          : "bg-white text-[#0B609D] group-hover:bg-[#0B609D] group-hover:text-white"
                      }
                    `}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="text-sm font-medium md:mt-1 md:text-[11px] md:font-normal text-center">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer links */}
        <div className="mt-6 flex flex-col gap-2 border-t border-[#C9D7ED] pt-5 md:mt-auto md:w-full md:gap-4 md:border-0 md:pt-0">
          {footerItems.map(({ label, icon: Icon, href }) => (
            <NavLink
              key={href}
              to={href}
              onClick={onClose}
              title={label}
              aria-label={label}
              className={({ isActive }) => `
                group flex items-center gap-4 rounded-xl px-4 py-3
                text-[#0B609D] transition-all
                md:w-full md:flex-col md:gap-1 md:px-0 md:py-0
                ${
                  isActive
                    ? "bg-white/70 md:bg-transparent"
                    : "hover:bg-white/60 md:hover:bg-transparent"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-full
                      transition-all md:h-12 md:w-12
                      ${
                        isActive
                          ? "bg-[#0B609D] text-white shadow-md"
                          : "bg-white text-[#0B609D] group-hover:bg-[#0B609D] group-hover:text-white"
                      }
                    `}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="text-sm font-medium md:mt-1 md:text-[11px] md:font-normal text-center">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
