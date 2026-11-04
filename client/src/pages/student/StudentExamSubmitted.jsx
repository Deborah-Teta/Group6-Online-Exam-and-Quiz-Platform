import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, LockKeyhole } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { loadAttempt } from "../../services/studentAttempts";
import { mockExamQuestions, mockExams, mockStudent } from "../../services/studentMockData";

// Exam times are shown in GMT, so the receipt uses the same clock.
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
      <p className="text-[11px] text-[#6d7180]">{label}</p>
      <p className="text-[13px] font-semibold text-[#202536]">{value}</p>
    </div>
  );
}

function StudentExamSubmitted() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const exam = mockExams.find((item) => item.id === examId);
  const attempt = loadAttempt(examId);

  if (!exam || !attempt) {
    return <Navigate to="/student/exams" replace />;
  }

  if (!attempt.submittedAt) {
    return <Navigate to={`/student/exams/${examId}/attempt`} replace />;
  }

  const questions = mockExamQuestions[examId];
  const answeredCount = questions.filter((item) => attempt.answers[item.id] !== undefined).length;

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex items-start justify-between gap-[24px] sm:items-center">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[30px] leading-[1.2] text-[#202536]">{exam.title}</p>
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
            {exam.className} · {exam.dateLabel}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge label="Submitted" variant="open" />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[24px] xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Submission receipt */}
        <Card className="flex flex-col gap-[20px] p-[24px]">
          <div className="flex size-[62px] items-center justify-center rounded-full bg-[#eaf4ee]">
            <Check size={29} strokeWidth={1.6} className="text-[#25715b]" />
          </div>

          <p className="text-[28px] font-semibold leading-[1.55] text-[#202536]">
            Your answers are in.
          </p>
          <p className="text-[15px] leading-[1.55] text-[#6d7180]">
            Thanks, {mockStudent.name.split(" ")[0]}. Your attempt has been submitted successfully. You can take a breath — there's nothing else to do.
          </p>

          <div className="h-px bg-[#e3e4e8]" />

          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3 sm:gap-[24px]">
            <ReceiptFact label="Submitted at" value={formatSubmittedAt(attempt.submittedAt)} />
            <ReceiptFact
              label="Answers saved"
              value={`${answeredCount} of ${questions.length} questions`}
            />
            <ReceiptFact label="Attempt" value="1 of 1 · Final" />
          </div>

          <div className="flex items-start gap-[12px] rounded-[7px] bg-[#eeedf9] p-[16px] text-[#5149b8]">
            <LockKeyhole size={19} strokeWidth={1.6} className="shrink-0" />
            <div className="flex flex-col gap-[4px] leading-[1.55]">
              <p className="text-[13px] font-semibold">Your results are still locked</p>
              <p className="text-[12px]">
                Scores and correct answers are hidden until the exam closes for everyone. You cannot edit or restart this attempt.
              </p>
            </div>
          </div>

          <div>
            <Button
              label="Back to my exams"
              variant="secondary"
              onClick={() => navigate("/student/exams")}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-[24px]">
          {/* Results release */}
          <SectionCard title="Results release">
            <LockKeyhole size={26} strokeWidth={1.6} className="text-[#5149b8]" />

            <div className="text-[26px] font-semibold leading-[1.55] text-[#202536]">
              <p>{exam.closesDate}</p>
              <p>{exam.closesAt} GMT</p>
            </div>

            <p className="text-[12px] leading-[1.55] text-[#6d7180]">
              Europe/London · After the scheduled exam window closes.
            </p>

            <div>
              <StatusBadge label="Not yet available" variant="closed" />
            </div>
          </SectionCard>

          {/* Only shown when the timer submitted the exam */}
          {attempt.submittedAutomatically && (
            <SectionCard title="Your time ran out">
              <p className="text-[13px] font-semibold leading-[1.55] text-[#202536]">
                Your time is up. We automatically submitted your saved answers at {exam.closesAt} GMT.
              </p>
              <p className="text-[11px] leading-[1.55] text-[#6d7180]">
                No extra attempt is created. Results unlock at the same closing time.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentExamSubmitted;
