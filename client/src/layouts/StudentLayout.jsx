import { useCallback, useEffect, useState } from "react";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { studentPageHeaders } from "./studentNavigation";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import {
  getStudentClasses,
  getStudentExams,
  updateStudentProfile,
} from "../services/studentService";

function StudentLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [student, setStudent] = useState(() => ({
    ...user,
    name: user?.name || user?.fullName || "Student",
    email: user?.email || "",
    role: "student",
    initials: (user?.name || user?.fullName || "S")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));

  const refreshStudentData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [classes, assessments] = await Promise.all([
        getStudentClasses(),
        getStudentExams(),
      ]);
      setEnrolledClasses(classes);
      setExams(assessments);
    } catch (error) {
      setLoadError(error.message || "Could not load student data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getStudentClasses(), getStudentExams()])
      .then(([classes, assessments]) => {
        if (!active) return;
        setEnrolledClasses(classes);
        setExams(assessments);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || "Could not load student data.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pageHeader = studentPageHeaders.find(({ href }) => matchPath(href, pathname));

  const updateStudent = async (changes) => {
    const updatedUser = await updateStudentProfile(changes.name);
    const authenticatedUser = updateUser({
      ...updatedUser,
      name: updatedUser.fullName,
      initials: changes.initials,
    });
    setStudent((current) => ({ ...current, ...authenticatedUser }));
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-left [color-scheme:light]">
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
        onLogout={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
      />

      <main className="pt-24 px-4 pb-16 flex flex-col gap-6 sm:px-6 md:ml-64 md:px-8">
        {loadError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={refreshStudentData}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
        <Outlet
          context={{
            enrolledClasses,
            exams,
            isLoading,
            refreshStudentData,
            student,
            updateStudent,
          }}
        />
      </main>
    </div>
  );
}

export default StudentLayout;
