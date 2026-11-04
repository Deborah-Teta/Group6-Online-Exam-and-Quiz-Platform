import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import { mockEnrolledClasses, mockStudent } from "../services/studentMockData";

function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState(mockEnrolledClasses);

  const joinClass = ({ id, name, teacher }) => {
    const joinedOn = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    setEnrolledClasses((current) => [...current, { id, name, teacher, joinedOn }]);
  };

  return (
    <div className="flex min-h-screen bg-page text-left [color-scheme:light]">
      <StudentSidebar
        student={mockStudent}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <StudentTopbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-[16px] sm:px-[32px] sm:pb-[48px] sm:pt-[24px]">
          <Outlet context={{ enrolledClasses, joinClass }} />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
