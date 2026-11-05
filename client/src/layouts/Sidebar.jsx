import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CircleHelp,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  Home,
  LayoutGrid,
  ListChecks,
  LogOut,
  Shield,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const navigationByRole = {
  teacher: [
    { label: "Dashboard", icon: Home, href: "/teacher/dashboard" },
    { label: "My classes", icon: GraduationCap, href: "/teacher/classes" },
    { label: "Question bank", icon: BookOpen, href: "/teacher/questions" },
    { label: "Exams", icon: ClipboardList, href: "/teacher/exams" },
    { label: "Results", icon: BarChart3, href: "/teacher/results" },
  ],
  student: [
    { label: "Dashboard", icon: LayoutGrid, href: "/student/dashboard" },
    { label: "My classes", icon: Users, href: "/student/classes" },
    { label: "My exams", icon: FileQuestion, href: "/student/exams" },
    { label: "My quizzes", icon: ListChecks, href: "/student/quizzes" },
    { label: "Results", icon: BarChart3, href: "/student/results" },
  ],
  admin: [
    { label: "Overview", icon: Home, href: "/admin" },
    { label: "Teacher approvals", icon: Users, href: "/admin/approvals" },
    { label: "Manage users", icon: Users, href: "/admin/users" },
    { label: "Manage classes", icon: GraduationCap, href: "/admin/classes" },
    { label: "Audit logs", icon: Shield, href: "/admin/audit" },
  ],
};

const roleLabels = {
  teacher: "Teacher workspace",
  student: "Student workspace",
  admin: "Admin workspace",
};

const settingsPaths = {
  teacher: null,
  student: "/student/settings",
  admin: "/admin/settings",
};

function Sidebar({ role, isOpen = false, onClose }) {
  const { user, signOut } = useAuth();
  const navigation = navigationByRole[role] || [];
  const displayName = user?.name || user?.fullName || "Your account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const settingsPath = settingsPaths[role];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-xl transition-transform duration-300 ease-in-out md:w-64 md:translate-x-0 md:px-4 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5149B8] text-white">
              <BookOpen size={19} strokeWidth={2} />
            </span>
            <span className="text-lg font-bold tracking-tight text-[#202536]">
              Exam<span className="text-[#5149B8]">Flow</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#6D7180] hover:bg-slate-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

       
        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {navigation.map(({ label, icon: Icon, href }) => (
            <NavLink
              key={href}
              to={href}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#F0EFFD] text-[#5149B8]"
                    : "text-[#6D7180] hover:bg-slate-50 hover:text-[#202536]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className={
                      isActive
                        ? "text-[#5149B8]"
                        : "text-[#6D7180] group-hover:text-[#202536]"
                    }
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          {role === "student" && (
            <NavLink
              to="/student/help"
              onClick={onClose}
              className={({ isActive }) =>
                `mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#F0EFFD] text-[#5149B8]"
                    : "text-[#6D7180] hover:bg-slate-50 hover:text-[#202536]"
                }`
              }
            >
              <CircleHelp size={17} strokeWidth={1.8} />
              Help & guidelines
            </NavLink>
          )}

          {settingsPath && (
            <NavLink
              to={settingsPath}
              onClick={onClose}
              className={({ isActive }) =>
                `mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#F0EFFD] text-[#5149B8]"
                    : "text-[#6D7180] hover:bg-slate-50 hover:text-[#202536]"
                }`
              }
            >
              <Settings size={17} strokeWidth={1.8} />
              Settings
            </NavLink>
          )}

          <div className="flex items-center gap-3 border-t border-slate-200 px-1 pt-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EFFD] text-xs font-semibold text-[#5149B8]">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#202536]">
                {displayName}
              </p>
              <p className="truncate text-[11px] capitalize text-[#6D7180]">
                {role}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-[#6D7180] transition hover:bg-slate-100 hover:text-[#5149B8]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
