import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const pageHeaders = {
  "/teacher/dashboard": {
    title: "Teacher dashboard",
    description: "A clear view of your classes and the day ahead.",
  },
  "/teacher/classes": {
    title: "My classes",
    description: "Manage your classes and student joining codes.",
  },
  "/teacher/questions": {
    title: "Question bank",
    description: "Create and manage questions for your assessments.",
  },
  "/teacher/ai-generator": {
    title: "AI question generator",
    description: "Generate question drafts from your lesson notes.",
  },
  "/teacher/exams": {
    title: "Exams",
    description: "Create and schedule exams for your classes.",
  },
  "/teacher/results": {
    title: "Results",
    description: "Review student scores and class performance.",
  },
};

function TeacherLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const pageHeader = pageHeaders[pathname] ?? pageHeaders["/teacher/dashboard"];

  const teacher = {
    name: "Sarah Morgan",
    email: "sarah.morgan@oakfield.edu",
    role: "teacher",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-left [color-scheme:light]">
      <Sidebar
        role="teacher"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Navbar
        user={teacher}
        title={pageHeader.title}
        description={pageHeader.description}
        notificationsPath={null}
        profilePath={null}
        settingsPath={null}
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main className="flex flex-col gap-6 px-4 pb-24 pt-24 sm:px-6 md:ml-28 md:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default TeacherLayout;