import { Link, useNavigate } from "react-router-dom";
import { assessmentTypes } from "../../services/studentAssessments";
import { loadAttempt } from "../../services/studentAttempts";
import Button from "./ActionButton";

function ExamAction({ exam, type = "exam" }) {
  const navigate = useNavigate();
  const { basePath, noun } = assessmentTypes[type];

  if (exam.status === "open" && loadAttempt(exam.id)?.submittedAt) {
    return (
      <Link
        to={`${basePath}/${exam.id}/submitted`}
        className="text-xs font-bold whitespace-nowrap text-[#0B609D] hover:underline"
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
      <Link to="/student/results" className="text-xs font-bold whitespace-nowrap text-[#0B609D] hover:underline">
        View results →
      </Link>
    );
  }

  return <span className="text-xs whitespace-nowrap text-slate-500">{exam.availability}</span>;
}

export default ExamAction;
