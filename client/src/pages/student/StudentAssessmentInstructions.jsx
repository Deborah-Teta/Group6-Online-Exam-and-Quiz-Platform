import { useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CalendarClock, CircleCheck, LockKeyhole, Send, Timer } from "lucide-react";
import Button from "../../components/common/Button";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { assessmentTypes } from "../../services/studentAssessments";
import { loadAttempt } from "../../services/studentAttempts";

function AssessmentRule({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-[16px]">
      <Icon size={21} strokeWidth={1.6} className="shrink-0 text-[#5149b8]" />
      <div className="flex min-w-0 flex-col gap-[5px] leading-[1.55]">
        <p className="text-[14px] font-semibold text-[#202536]">{title}</p>
        <p className="text-[13px] text-[#6d7180]">{children}</p>
      </div>
    </div>
  );
}

function AssessmentFact({ label, value }) {
  return (
    <div className="flex flex-col gap-[3px] leading-[1.55]">
      <p className="text-[11px] text-[#6d7180]">{label}</p>
      <p className="text-[14px] font-semibold text-[#202536]">{value}</p>
    </div>
  );
}

function StudentAssessmentInstructions({ type }) {
  const { items, noun, basePath } = assessmentTypes[type];

  const navigate = useNavigate();
  const { examId } = useParams();
  const { enrolledClasses } = useOutletContext();
  const [hasAccepted, setHasAccepted] = useState(false);

  const assessment = items.find((item) => item.id === examId);

  // Only an open exam or quiz can be started, so anything else goes back to the list.
  if (assessment?.status !== "open") {
    return <Navigate to={basePath} replace />;
  }

  // There is only one attempt, so a submitted one can't be started again.
  if (loadAttempt(assessment.id)?.submittedAt) {
    return <Navigate to={`${basePath}/${assessment.id}/submitted`} replace />;
  }

  const teacher = enrolledClasses.find((item) => item.name === assessment.className)?.teacher;

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-[24px] sm:items-center">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[30px] leading-[1.2] text-[#202536]">{assessment.title}</p>
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
            {assessment.className} · {teacher}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge label={assessment.statusLabel} variant={assessment.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[24px] xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Rules */}
        <SectionCard title="A moment before you begin">
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">{assessment.summary}</p>

          <div className="flex flex-col gap-[24px]">
            <AssessmentRule icon={CalendarClock} title="A scheduled window">
              {assessment.windowLabel}. You can only start while this window is open.
            </AssessmentRule>
            <AssessmentRule
              icon={Timer}
              title={`${assessment.durationMinutes} minutes, ending at ${assessment.closesAt}`}
            >
              Starting late does not extend the closing time. Your countdown shows the time left until the {noun} ends.
            </AssessmentRule>
            <AssessmentRule icon={CircleCheck} title="One attempt. One final submission.">
              Your answers save automatically. You can move between questions before you submit, but you cannot retake the {noun}.
            </AssessmentRule>
            <AssessmentRule icon={Send} title="Automatic submission on expiry">
              At {assessment.closesAt} GMT your saved answers are submitted, including any unanswered questions. Unanswered questions earn 0 points.
            </AssessmentRule>
            <AssessmentRule icon={LockKeyhole} title={`Results after the ${noun} closes`}>
              Your score and correct answers become available at {assessment.closesAt} GMT, not immediately after an early submission.
            </AssessmentRule>
          </div>
        </SectionCard>

        {/* Summary and start */}
        <SectionCard title={`Your ${noun} at a glance`}>
          <AssessmentFact label="Questions" value={assessment.questionCount} />
          <AssessmentFact label="Total points" value={assessment.totalPoints} />
          <AssessmentFact label="Types" value={assessment.questionTypes} />
          <AssessmentFact label="Duration" value={`${assessment.durationMinutes} minutes`} />
          <AssessmentFact label="Closes" value={assessment.closesLabel} />

          <div className="h-px bg-[#e3e4e8]" />

          <label className="flex cursor-pointer items-start gap-[8px] text-[12px] leading-[1.55] text-[#202536]">
            <input
              type="checkbox"
              checked={hasAccepted}
              onChange={(event) => setHasAccepted(event.target.checked)}
              className="mt-[2px] size-[14px] shrink-0 cursor-pointer accent-[#5149b8]"
            />
            I understand the rules and that I have only one attempt.
          </label>

          <div>
            <Button
              label={`Start ${noun} →`}
              disabled={!hasAccepted}
              onClick={() =>
                navigate(`${basePath}/${assessment.id}/attempt`, { state: { hasAccepted: true } })
              }
            />
          </div>

          <p className="text-[11px] leading-[1.55] text-[#6d7180]">
            Starting now opens your only attempt.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

export default StudentAssessmentInstructions;
