import { useEffect, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Check, LockKeyhole } from "lucide-react";
import Button from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Notice from "../../components/common/Notice";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { assessmentTypes } from "../../services/studentAssessments";
import { getStudentAttempt } from "../../services/studentService";
import { formatPercent } from "../../utils/scores";

const formatSubmittedAt = (timestamp) => {
  if (!timestamp) return "Submitted";
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${day} · ${time} GMT`;
};

function ReceiptFact({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 leading-[1.55]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-[13px] font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StudentAssessmentSubmitted({ type }) {
  const { noun, plural, basePath } = assessmentTypes[type];
  const { examId } = useParams();
  const { exams, isLoading, student } = useOutletContext();
  const [attempt, setAttempt] = useState(null);
  const [isAttemptLoading, setIsAttemptLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const assessment = exams.find((item) => item.id === examId && item.type === type);

  useEffect(() => {
    let active = true;
    getStudentAttempt(examId)
      .then((result) => {
        if (active) setAttempt(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load the submission.");
      })
      .finally(() => {
        if (active) setIsAttemptLoading(false);
      });

    return () => {
      active = false;
    };
  }, [examId]);

  if (isLoading || isAttemptLoading) {
    return <p className="py-8 text-center text-sm text-muted">Loading submission…</p>;
  }
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!assessment || !attempt) return <Navigate to={basePath} replace />;
  if (attempt.status === "in_progress") {
    return <Navigate to={`${basePath}/${examId}/attempt`} replace />;
  }

  return (
    <>
      <div className="flex items-start justify-between gap-6 sm:items-center">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-xl font-bold tracking-tight text-main">{assessment.title}</p>
          <p className="text-[13px] text-muted">
            {assessment.className} · {assessment.dateLabel}
          </p>
        </div>
        <StatusBadge label="Submitted" variant="open" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50">
            <Check size={24} className="text-emerald-700" />
          </div>
          <p className="text-xl font-bold text-main">Your answers are in.</p>
          <p className="text-[15px] leading-[1.55] text-muted">
            Thanks, {student.name.split(" ")[0]}. Your attempt has been submitted successfully.
          </p>
          <div className="h-px bg-line" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <ReceiptFact
              label="Submitted at"
              value={formatSubmittedAt(attempt.submittedAt)}
            />
            <ReceiptFact
              label="Answers saved"
              value={`${attempt.answeredCount ?? 0} of ${assessment.questionCount} questions`}
            />
            <ReceiptFact label="Attempt" value="1 of 1 · Final" />
          </div>

          {attempt.resultReleased ? (
            <Notice icon={Check} title="Your results are available" variant="neutral">
              Score: {formatPercent(attempt.percentage)} ({attempt.score} of {attempt.totalPoints} points).
            </Notice>
          ) : (
            <Notice icon={LockKeyhole} title="Your results are still locked">
              Scores and correct answers are hidden until the {noun} closes. You cannot edit or restart this attempt.
            </Notice>
          )}

          <div>
            <Button
              label={`Back to my ${plural}`}
              variant="secondary"
              onClick={() => navigate(basePath)}
            />
          </div>
        </Card>

        <SectionCard title="Results release">
          <LockKeyhole size={26} className="text-primary" />
          {attempt.resultReleased ? (
            <>
              <p className="text-[22px] font-bold text-main">
                {formatPercent(attempt.percentage)}
              </p>
              <p className="text-xs text-muted">
                {attempt.score} of {attempt.totalPoints} points
              </p>
              <StatusBadge label="Available" variant="open" />
            </>
          ) : (
            <>
              <p className="text-[22px] font-bold text-main">
                {assessment.closesDate}
              </p>
              <p className="text-xs text-muted">
                {assessment.closesTime} GMT · Results unlock after the assessment closes.
              </p>
              <StatusBadge label="Not yet available" variant="closed" />
            </>
          )}
        </SectionCard>
      </div>
    </>
  );
}

export default StudentAssessmentSubmitted;
