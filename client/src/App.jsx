import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import StudentLayout from './layouts/StudentLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import StudentAssessmentAttempt from './pages/student/StudentAssessmentAttempt';
import StudentAssessmentInstructions from './pages/student/StudentAssessmentInstructions';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentAssessmentSubmitted from './pages/student/StudentAssessmentSubmitted';
import StudentClasses from './pages/student/StudentClasses';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentHelp from './pages/student/StudentHelp';
import StudentJoinClass from './pages/student/StudentJoinClass';
import StudentResults from './pages/student/StudentResults';
import StudentSettings from './pages/student/StudentSettings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />

      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="classes" element={<StudentClasses />} />
        <Route path="classes/join" element={<StudentJoinClass />} />
        <Route path="exams" element={<StudentAssessments key="exam" type="exam" />} />
        <Route path="exams/:examId/instructions" element={<StudentAssessmentInstructions key="exam" type="exam" />} />
        <Route path="exams/:examId/attempt" element={<StudentAssessmentAttempt key="exam" type="exam" />} />
        <Route path="exams/:examId/submitted" element={<StudentAssessmentSubmitted key="exam" type="exam" />} />
        <Route path="quizzes" element={<StudentAssessments key="quiz" type="quiz" />} />
        <Route path="quizzes/:examId/instructions" element={<StudentAssessmentInstructions key="quiz" type="quiz" />} />
        <Route path="quizzes/:examId/attempt" element={<StudentAssessmentAttempt key="quiz" type="quiz" />} />
        <Route path="quizzes/:examId/submitted" element={<StudentAssessmentSubmitted key="quiz" type="quiz" />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="help" element={<StudentHelp />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}

export default App;
