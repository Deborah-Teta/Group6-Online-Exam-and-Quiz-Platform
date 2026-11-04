import { Link, useNavigate } from "react-router-dom";
import { assessmentTypes } from "../../services/studentAssessments";
import { loadAttempt } from "../../services/studentAttempts";
import Button from "./Button";

function ExamAction({ exam, type = "exam" }) {
  const navigate = useNavigate();
  const { basePath, noun } = assessmentTypes[type];

  if (exam.status === "open" && loadAttempt(exam.id)?.submittedAt) {
    return (
      <Link
        to={`${basePath}/${exam.id}/submitted`}
        className="text-[12px] whitespace-nowrap text-primary hover:underline"
      >
        View submission →
      </Link>
    );
  }

  if (exam.status === "open") {
    return (
      <Button
        label={`View ${noun} →`}
        onClick={() => navigate(`${basePath}/${exam.id}/instructions`)}
      />
    );
  }

  if (exam.status === "closed") {
    return (
      <Link to="/student/results" className="text-[12px] whitespace-nowrap text-primary hover:underline">
        View results →
      </Link>
    );
  }

  return <span className="text-[12px] whitespace-nowrap text-muted">{exam.availability}</span>;
}

export default ExamAction;
