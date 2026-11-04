import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import StudentLayout from './layouts/StudentLayout';
import StudentClasses from './pages/student/StudentClasses';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExams from './pages/student/StudentExams';
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
        <Route path="exams" element={<StudentExams />} />
        <Route path="exams/:examId/instructions" element={<StudentPlaceholder title="Exam instructions" />} />
        <Route path="quizzes" element={<StudentPlaceholder title="My quizzes" />} />
        <Route path="results" element={<StudentPlaceholder title="Results" />} />
      </Route>

      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}

export default App;
