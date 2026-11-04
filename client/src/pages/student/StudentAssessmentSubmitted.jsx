import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Check, LockKeyhole } from "lucide-react";
import Button from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Notice from "../../components/common/Notice";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { loadAttempt } from "../../services/studentAttempts";
import { assessmentTypes } from "../../services/studentAssessments";

// Scheduled times are shown in GMT, so the receipt uses the same clock.
const formatSubmittedAt = (timestamp) => {
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
    <div className="flex min-w-0 flex-col gap-[6px] leading-[1.55]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-[13px] font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StudentAssessmentSubmitted({ type }) {
  const { items, questions: allQuestions, noun, plural, basePath } = assessmentTypes[type];

  const navigate = useNavigate();
  const { student } = useOutletContext();
  const { examId } = useParams();

  const assessment = items.find((item) => item.id === examId);
  const attempt = loadAttempt(examId);

  if (!assessment || !attempt) {
    return <Navigate to={basePath} replace />;
  }

  if (!attempt.submittedAt) {
    return <Navigate to={`${basePath}/${examId}/attempt`} replace />;
  }

  const questions = allQuestions[examId];
  const answeredCount = questions.filter((item) => attempt.answers[item.id] !== undefined).length;

  return (
    <>
      {/* Page heading */}
      <div className="flex items-start justify-between gap-6 sm:items-center">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[20px] font-bold leading-[1.3] tracking-[-0.3px] text-main">{assessment.title}</p>
          <p className="text-[13px] leading-normal text-muted">
            {assessment.className} · {assessment.dateLabel}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge label="Submitted" variant="open" />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Submission receipt */}
        <Card className="flex flex-col gap-[16px] p-[20px]">
          <div className="flex size-[48px] items-center justify-center rounded-full bg-emerald-50">
            <Check size={24} strokeWidth={1.6} className="text-emerald-700" />
          </div>

          <p className="text-[20px] font-bold leading-[1.3] tracking-[-0.3px] text-main">
            Your answers are in.
          </p>
          <p className="text-[15px] leading-[1.55] text-muted">
            Thanks, {student.name.split(" ")[0]}. Your attempt has been submitted successfully. You can take a breath — there's nothing else to do.
          </p>

          <div className="h-px bg-line" />

          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3 sm:gap-6">
            <ReceiptFact label="Submitted at" value={formatSubmittedAt(attempt.submittedAt)} />
            <ReceiptFact
              label="Answers saved"
              value={`${answeredCount} of ${questions.length} questions`}
            />
            <ReceiptFact label="Attempt" value="1 of 1 · Final" />
          </div>

          <Notice icon={LockKeyhole} title="Your results are still locked">
            Scores and correct answers are hidden until the {noun} closes for everyone. You cannot edit or restart this attempt.
          </Notice>

          <div>
            <Button
              label={`Back to my ${plural}`}
              variant="secondary"
              onClick={() => navigate(basePath)}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Results release */}
          <SectionCard title="Results release">
            <LockKeyhole size={26} strokeWidth={1.6} className="text-primary" />

            <div className="text-[22px] font-bold leading-[1.3] tracking-[-0.3px] text-main">
              <p>{assessment.closesDate}</p>
              <p>{assessment.closesAt} GMT</p>
            </div>

            <p className="text-[12px] leading-[1.55] text-muted">
              Europe/London · After the scheduled {noun} window closes.
            </p>

            <div>
              <StatusBadge label="Not yet available" variant="closed" />
            </div>
          </SectionCard>

          {/* Only shown when the timer submitted it */}
          {attempt.submittedAutomatically && (
            <SectionCard title="Your time ran out">
              <p className="text-[13px] font-semibold leading-[1.55] text-main">
                Your time is up. We automatically submitted your saved answers at {assessment.closesAt} GMT.
              </p>
              <p className="text-[11px] leading-[1.55] text-muted">
                No extra attempt is created. Results unlock at the same closing time.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
}

export default StudentAssessmentSubmitted;
