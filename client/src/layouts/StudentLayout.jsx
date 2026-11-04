import { useState } from "react";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { studentPageHeaders } from "./studentNavigation";
import { mockEnrolledClasses, mockStudent } from "../services/studentMockData";

function StudentLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState(mockEnrolledClasses);
  const [student, setStudent] = useState(mockStudent);

  const pageHeader = studentPageHeaders.find(({ href }) => matchPath(href, pathname));

  const updateStudent = (changes) => {
    setStudent((current) => ({ ...current, ...changes }));
  };

  const joinClass = ({ id, name, teacher }) => {
    const joinedOn = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    setEnrolledClasses((current) => [...current, { id, name, teacher, joinedOn }]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-left [color-scheme:light]">
      <Sidebar
        role="student"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Navbar
        user={{ name: student.name, role: "student", email: student.email }}
        title={typeof pageHeader?.title === "function" ? pageHeader.title(student) : pageHeader?.title}
        description={pageHeader?.description}
        notificationsPath={null}
        profilePath={null}
        settingsPath="/student/settings"
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main className="md:ml-28 pt-24 px-4 sm:px-6 md:px-8 pb-16 flex flex-col gap-6">
        <Outlet context={{ enrolledClasses, joinClass, student, updateStudent }} />
      </main>
    </div>
  );
}

export default StudentLayout;
