import { Link, useNavigate } from "react-router-dom";
import { loadAttempt } from "../../services/studentAttempts";
import Button from "./Button";

function ExamAction({ exam }) {
  const navigate = useNavigate();

  if (exam.status === "open" && loadAttempt(exam.id)?.submittedAt) {
    return (
      <Link
        to={`/student/exams/${exam.id}/submitted`}
        className="text-[12px] whitespace-nowrap text-[#5149b8] hover:underline"
      >
        View submission →
      </Link>
    );
  }

  if (exam.status === "open") {
    return (
      <Button
        label="View exam →"
        onClick={() => navigate(`/student/exams/${exam.id}/instructions`)}
      />
    );
  }

  if (exam.status === "closed") {
    return (
      <Link to="/student/results" className="text-[12px] whitespace-nowrap text-[#5149b8] hover:underline">
        View results →
      </Link>
    );
  }

  return <span className="text-[12px] whitespace-nowrap text-[#6d7180]">{exam.availability}</span>;
}

export default ExamAction;
