import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import StudentLayout from './layouts/StudentLayout';
import StudentAssessmentInstructions from './pages/student/StudentAssessmentInstructions';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentClasses from './pages/student/StudentClasses';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExamAttempt from './pages/student/StudentExamAttempt';
import StudentExamSubmitted from './pages/student/StudentExamSubmitted';
import StudentJoinClass from './pages/student/StudentJoinClass';
import StudentPlaceholder from './pages/student/StudentPlaceholder';

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
        <Route path="exams/:examId/attempt" element={<StudentExamAttempt />} />
        <Route path="exams/:examId/submitted" element={<StudentExamSubmitted />} />
        <Route path="quizzes" element={<StudentAssessments key="quiz" type="quiz" />} />
        <Route path="quizzes/:examId/instructions" element={<StudentAssessmentInstructions key="quiz" type="quiz" />} />
        <Route path="quizzes/:examId/attempt" element={<StudentPlaceholder title="Quiz in progress" />} />
        <Route path="results" element={<StudentPlaceholder title="Results" />} />
      </Route>

      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}

export default App;
