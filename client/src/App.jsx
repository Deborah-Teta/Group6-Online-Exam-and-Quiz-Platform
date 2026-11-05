import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import GuestRoute from "./components/auth/GuestRoute";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { roleHomePaths } from "./context/roleHomePaths";
import { useAuth } from "./context/useAuth";
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import StudentAssessmentAttempt from "./pages/student/StudentAssessmentAttempt";
import StudentAssessmentInstructions from "./pages/student/StudentAssessmentInstructions";
import StudentAssessments from "./pages/student/StudentAssessments";
import StudentAssessmentSubmitted from "./pages/student/StudentAssessmentSubmitted";
import StudentClasses from "./pages/student/StudentClasses";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentHelp from "./pages/student/StudentHelp";
import StudentJoinClass from "./pages/student/StudentJoinClass";
import StudentResults from "./pages/student/StudentResults";
import StudentSettings from "./pages/student/StudentSettings";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherCreateExam from "./pages/teacher/TeacherCreateExam";
import TeacherQuestionBank from "./pages/teacher/TeacherQuestionBank";
import TeacherResults from "./pages/teacher/TeacherResults";
import TeacherDashboard from "./components/Teacher/Dashboard";

function HomeRedirect() {
  const { user } = useAuth();
  return (
    <Navigate
      to={user ? roleHomePaths[user.role] || "/login" : "/login"}
      replace
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <SignIn />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignUp />
          </GuestRoute>
        }
      />

      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route
            path="questions"
            element={<TeacherQuestionBank />}
          />
          <Route
            path="ai-generator"
            element={
              <p className="text-slate-600">
                Teacher AI question generator page is next.
              </p>
            }
          />
          <Route path="exams" element={<TeacherCreateExam />} />
          <Route path="results" element={<TeacherResults />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="classes/join" element={<StudentJoinClass />} />
          <Route
            path="exams"
            element={<StudentAssessments key="exam" type="exam" />}
          />
          <Route
            path="exams/:examId/instructions"
            element={<StudentAssessmentInstructions key="exam" type="exam" />}
          />
          <Route
            path="exams/:examId/attempt"
            element={<StudentAssessmentAttempt key="exam" type="exam" />}
          />
          <Route
            path="exams/:examId/submitted"
            element={<StudentAssessmentSubmitted key="exam" type="exam" />}
          />
          <Route
            path="quizzes"
            element={<StudentAssessments key="quiz" type="quiz" />}
          />
          <Route
            path="quizzes/:examId/instructions"
            element={<StudentAssessmentInstructions key="quiz" type="quiz" />}
          />
          <Route
            path="quizzes/:examId/attempt"
            element={<StudentAssessmentAttempt key="quiz" type="quiz" />}
          />
          <Route
            path="quizzes/:examId/submitted"
            element={<StudentAssessmentSubmitted key="quiz" type="quiz" />}
          />
          <Route path="results" element={<StudentResults />} />
          <Route path="help" element={<StudentHelp />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;
