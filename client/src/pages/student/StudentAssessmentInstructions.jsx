import { useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CalendarClock, CircleCheck, LockKeyhole, Send, Timer } from "lucide-react";
import Button from "../../components/common/ActionButton";
import InfoRow from "../../components/common/InfoRow";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { assessmentTypes } from "../../services/studentAssessments";
import { startStudentExam } from "../../services/studentService";

function AssessmentFact({ label, value }) {
  return (
    <div className="flex flex-col gap-[3px] leading-[1.55]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-[14px] font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StudentAssessmentInstructions({ type }) {
  const { noun, basePath } = assessmentTypes[type];
  const navigate = useNavigate();
  const { examId } = useParams();
  const { exams, isLoading } = useOutletContext();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const assessment = exams.find((item) => item.id === examId && item.type === type);

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted">Loading assessment…</p>;
  }

  if (!assessment) return <Navigate to={basePath} replace />;

  if (assessment.attempt && assessment.attempt.status !== "in_progress") {
    return <Navigate to={`${basePath}/${assessment.id}/submitted`} replace />;
  }

  if (assessment.attempt?.status !== "in_progress" && assessment.status !== "open") {
    return <Navigate to={basePath} replace />;
  }

  const handleStart = async () => {
    if (assessment.attempt?.status === "in_progress") {
      navigate(`${basePath}/${assessment.id}/attempt`, { replace: true });
      return;
    }

    setIsStarting(true);
    setError("");
    try {
      await startStudentExam(assessment.id);
      navigate(`${basePath}/${assessment.id}/attempt`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || `Could not start this ${noun}.`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-6 sm:items-center">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[20px] font-bold leading-[1.3] tracking-[-0.3px] text-main">
            {assessment.title}
          </p>
          <p className="text-[13px] leading-normal text-muted">
            {assessment.className} · {assessment.teacher}
          </p>
        </div>
        <StatusBadge label={assessment.statusLabel} variant={assessment.status} />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <SectionCard title="A moment before you begin">
          <p className="text-[14px] leading-[1.55] text-muted">
            {assessment.summary}
          </p>
          <div className="flex flex-col gap-6">
            <InfoRow icon={CalendarClock} title="A scheduled window">
              {assessment.windowLabel}. You can only start while this window is open.
            </InfoRow>
            <InfoRow
              icon={Timer}
              title={`${assessment.durationMinutes} minutes, ending at ${assessment.closesTime} GMT`}
            >
              Starting late does not extend the closing time. Your countdown shows the time left until the {noun} ends.
            </InfoRow>
            <InfoRow icon={CircleCheck} title="One attempt. One final submission.">
              Your answers save automatically. You can move between questions before you submit, but you cannot retake the {noun}.
            </InfoRow>
            <InfoRow icon={Send} title="Automatic submission on expiry">
              Your saved answers are automatically submitted when time runs out. Unanswered questions earn 0 points.
            </InfoRow>
            <InfoRow icon={LockKeyhole} title={`Results after the ${noun} closes`}>
              Your score and correct answers become available after the scheduled window closes.
            </InfoRow>
          </div>
        </SectionCard>

        <SectionCard title={`Your ${noun} at a glance`}>
          <AssessmentFact label="Questions" value={assessment.questionCount} />
          <AssessmentFact label="Total points" value={assessment.totalPoints} />
          <AssessmentFact label="Types" value={assessment.questionTypes} />
          <AssessmentFact label="Duration" value={`${assessment.durationMinutes} minutes`} />
          <AssessmentFact label="Closes" value={assessment.closesLabel} />
          <div className="h-px bg-line" />
          <label className="flex cursor-pointer items-start gap-[8px] text-[12px] leading-[1.55] text-main">
            <input
              type="checkbox"
              checked={hasAccepted || assessment.attempt?.status === "in_progress"}
              onChange={(event) => setHasAccepted(event.target.checked)}
              disabled={assessment.attempt?.status === "in_progress"}
              className="mt-[2px] size-[14px] shrink-0 cursor-pointer accent-primary"
            />
            I understand the rules and that I have only one attempt.
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div>
            <Button
              label={
                isStarting
                  ? "Starting..."
                  : assessment.attempt
                    ? `Continue ${noun} →`
                    : `Start ${noun} →`
              }
              disabled={!hasAccepted && !assessment.attempt || isStarting}
              onClick={handleStart}
            />
          </div>
          <p className="text-[11px] leading-[1.55] text-muted">
            Starting now opens your only attempt.
          </p>
        </SectionCard>
      </div>
    </>
  );
}

export default StudentAssessmentInstructions;
