import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  UserRound,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

function Navbar({
  user,
  title,
  description,
  notificationsPath = "/admin/approvals",
  profilePath = "/admin/profile",
  settingsPath = "/admin/settings",
  onMenuClick,
  onLogout,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic header title based on current view
  const getHeaderInfo = () => {
    if (location.pathname.includes('/admin/profile')) {
      return {
        title: "My Administrator Profile",
        desc: "Personal credentials, deployment role, and active session controls"
      };
    }
    if (location.pathname.includes('/admin/settings')) {
      return {
        title: "Configure platform parameters, daily AI quotas, and security gates",
        desc: ""
      };
    }
    return {
      title: `Welcome back, ${user?.name || "User"}!`,
      desc: user?.role === "admin"
        ? "Administrative Control Center • Online Exam & Quiz Platform"
        : "Here's what's happening in your workspace today."
    };
  };

  const headerInfo = title ? { title, desc: description } : getHeaderInfo();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:px-6 md:left-64 md:px-8">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            {headerInfo.title}
          </p>
          {headerInfo.desc && (
            <p className="hidden text-xs font-medium text-slate-500 sm:block">
              {headerInfo.desc}
            </p>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          onClick={() => notificationsPath && navigate(notificationsPath)}
          className="relative rounded-full bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer"
          aria-label="Notifications"
          title="View pending faculty approvals"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 transition hover:bg-slate-50 shadow-xs cursor-pointer"
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5149B8] text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-800">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5149B8]">
                {user?.role || "Administrator"}
              </p>
            </div>

            <ChevronDown
              size={14}
              className={`hidden text-slate-400 transition-transform sm:block ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{user?.name || "Admin"}</p>
                <p className="text-[11px] text-slate-500">{user?.email || "admin@examplatform.edu"}</p>
              </div>

              {profilePath && (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate(profilePath);
                  }}
                >
                  <UserRound size={15} />
                  My Profile
                </button>
              )}

              {settingsPath && (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate(settingsPath);
                  }}
                >
                  <Settings size={15} />
                  Settings
                </button>
              )}

              {(profilePath || settingsPath) && <div className="my-1 border-t border-slate-100" />}

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
