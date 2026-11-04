import { useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CalendarClock, CircleCheck, LockKeyhole, Send, Timer } from "lucide-react";
import Button from "../../components/common/Button";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { loadAttempt } from "../../services/studentAttempts";
import { mockExams } from "../../services/studentMockData";

function ExamRule({ icon: Icon, title, children }) {
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

function ExamFact({ label, value }) {
  return (
    <div className="flex flex-col gap-[3px] leading-[1.55]">
      <p className="text-[11px] text-[#6d7180]">{label}</p>
      <p className="text-[14px] font-semibold text-[#202536]">{value}</p>
    </div>
  );
}

function StudentExamInstructions() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { enrolledClasses } = useOutletContext();
  const [hasAccepted, setHasAccepted] = useState(false);

  const exam = mockExams.find((item) => item.id === examId);

  // Only an open exam can be started, so anything else goes back to the list.
  if (exam?.status !== "open") {
    return <Navigate to="/student/exams" replace />;
  }

  // There is only one attempt, so a submitted exam can't be started again.
  if (loadAttempt(exam.id)?.submittedAt) {
    return <Navigate to={`/student/exams/${exam.id}/submitted`} replace />;
  }

  const teacher = enrolledClasses.find((item) => item.name === exam.className)?.teacher;

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-[24px] sm:items-center">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[30px] leading-[1.2] text-[#202536]">{exam.title}</p>
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
            {exam.className} · {teacher}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge label={exam.statusLabel} variant={exam.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[24px] xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Rules */}
        <SectionCard title="A moment before you begin">
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">{exam.summary}</p>

          <div className="flex flex-col gap-[24px]">
            <ExamRule icon={CalendarClock} title="A scheduled window">
              {exam.windowLabel}. You can only start while this window is open.
            </ExamRule>
            <ExamRule
              icon={Timer}
              title={`${exam.durationMinutes} minutes, ending at ${exam.closesAt}`}
            >
              Starting late does not extend the closing time. Your countdown shows the time left until the exam ends.
            </ExamRule>
            <ExamRule icon={CircleCheck} title="One attempt. One final submission.">
              Your answers save automatically. You can move between questions before you submit, but you cannot retake the exam.
            </ExamRule>
            <ExamRule icon={Send} title="Automatic submission on expiry">
              At {exam.closesAt} GMT your saved answers are submitted, including any unanswered questions. Unanswered questions earn 0 points.
            </ExamRule>
            <ExamRule icon={LockKeyhole} title="Results after the exam closes">
              Your score and correct answers become available at {exam.closesAt} GMT, not immediately after an early submission.
            </ExamRule>
          </div>
        </SectionCard>

        {/* Summary and start */}
        <SectionCard title="Your exam at a glance">
          <ExamFact label="Questions" value={exam.questionCount} />
          <ExamFact label="Total points" value={exam.totalPoints} />
          <ExamFact label="Types" value={exam.questionTypes} />
          <ExamFact label="Duration" value={`${exam.durationMinutes} minutes`} />
          <ExamFact label="Closes" value={exam.closesLabel} />

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
              label="Start exam →"
              disabled={!hasAccepted}
              onClick={() =>
                navigate(`/student/exams/${exam.id}/attempt`, { state: { hasAccepted: true } })
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

export default StudentExamInstructions;
