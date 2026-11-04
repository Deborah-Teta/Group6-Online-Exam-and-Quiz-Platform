import {useState} from "react";
import {
    Menu,
    Bell,
    UserRound,
    ChevronDown,
    LogOut,
    Settings,

} from "lucide-react";

function Navbar({ user, onMenuClick, onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="fixed px-8 top-0 left-0 right-0 z-40 pr-16 rounded-2xl md:left-28 md:pr-6 py-1 md:py-2 flex items-center justify-between bg-[#EEF3FD]">

      {/* Left section */}
      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-3xl  font-semibold text-slate-900">
            Welcome back, {user?.name || "User"}!
          </p>

          <p className="hidden text-sm text-slate-500 sm:block">
            Here's what's happening in your workspace today.
          </p>
        </div>

      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Profile */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role || "Member"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform sm:block ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setIsProfileOpen(false)}
              >
                <UserRound size={17} />
                My Profile
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={17} />
                Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout?.();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
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