import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentFooter from "./StudentFooter";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import { mockStudent } from "../services/studentMockData";

function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f7f2] text-left font-['DM_Sans',system-ui,sans-serif] [font-variation-settings:'opsz'_14]">
      <StudentSidebar
        student={mockStudent}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <StudentTopbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-[20px] sm:p-[40px]">
          <Outlet />
        </main>

        <StudentFooter student={mockStudent} />
      </div>
    </div>
  );
}

export default StudentLayout;
