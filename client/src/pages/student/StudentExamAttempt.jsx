import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CloudCheck, Info, Timer, TriangleAlert } from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import {
  loadAttempt,
  recordAnswer,
  startAttempt,
  submitAttempt,
} from "../../services/studentAttempts";
import { mockExamQuestions, mockExams } from "../../services/studentMockData";

const formatCountdown = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function AnswerOption({ name, marker, label, isSelected, onSelect }) {
  return (
    <label
      className={`
        relative flex min-h-[54px] cursor-pointer items-center gap-[12px] rounded-[7px] border p-[14px]
        transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#5149b8]
        ${
          isSelected
            ? "border-[#5149b8] bg-[#eeedf9]"
            : "border-[#e3e4e8] bg-white hover:bg-[#f7f7f2]"
        }
      `}
    >
      <input
        type="radio"
        name={name}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={`
          flex size-[25px] shrink-0 items-center justify-center rounded-full border
          text-[11px] font-semibold leading-[1.55]
          ${
            isSelected
              ? "border-[#5149b8] bg-[#5149b8] text-white"
              : "border-[#e3e4e8] text-[#202536]"
          }
        `}
      >
        {marker}
      </span>
      <span className="min-w-0 text-[14px] leading-[1.55] text-[#202536]">{label}</span>
    </label>
  );
}

function QuestionNumber({ number, isCurrent, isAnswered, onClick }) {
  const borderColor = isCurrent
    ? "border-[#5149b8]"
    : isAnswered
      ? "border-transparent"
      : "border-[#e3e4e8]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Question ${number}, ${isAnswered ? "answered" : "not answered"}`}
      aria-current={isCurrent ? "step" : undefined}
      className={`
        flex size-[39px] cursor-pointer items-center justify-center rounded-[6px] border-[1.5px]
        text-[14px] font-semibold leading-[1.55] transition-colors
        ${borderColor}
        ${isAnswered ? "bg-[#eeedf9]" : "bg-white hover:bg-[#f7f7f2]"}
        ${isAnswered || isCurrent ? "text-[#5149b8]" : "text-[#6d7180]"}
      `}
    >
      {number}
    </button>
  );
}

function UnansweredNotice({ questionNumbers }) {
  const isSingle = questionNumbers.length === 1;
  const numberList = new Intl.ListFormat("en-GB").format(questionNumbers.map(String));

  return (
    <div className="flex items-start gap-[12px] rounded-[7px] bg-[#fbf3e2] p-[16px] text-[#96651d]">
      <TriangleAlert size={19} strokeWidth={1.6} className="shrink-0" />
      <div className="flex flex-col gap-[4px] leading-[1.55]">
        <p className="text-[13px] font-semibold">
          {isSingle ? "1 question is unanswered" : `${questionNumbers.length} questions are unanswered`}
        </p>
        <p className="text-[12px]">
          {isSingle ? "Question" : "Questions"} {numberList} will receive 0 points if you submit now.
        </p>
      </div>
    </div>
  );
}

function ExamAttempt({ exam, questions, teacher, initialAttempt }) {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(
    () => initialAttempt ?? startAttempt(exam.id, exam.durationMinutes),
  );
  const [now, setNow] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { deadline, answers, savedAt } = attempt;
  const submittedPath = `/student/exams/${exam.id}/submitted`;

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);

      // Time is up, so whatever has been saved is submitted automatically.
      if (current >= deadline) {
        submitAttempt(exam.id);
        navigate(submittedPath, { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, exam.id, navigate, submittedPath]);

  const question = questions[currentIndex];
  const selectedOption = answers[question.id];
  const answeredCount = questions.filter((item) => answers[item.id] !== undefined).length;
  const unansweredNumbers = questions.flatMap((item, index) =>
    answers[item.id] === undefined ? [index + 1] : [],
  );
  const secondsLeft = Math.max(Math.ceil((deadline - now) / 1000), 0);

  const handleSubmit = () => {
    submitAttempt(exam.id);
    navigate(submittedPath, { replace: true });
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between sm:gap-[24px]">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[30px] leading-[1.2] text-[#202536]">{exam.title}</p>
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
            {exam.className} · {teacher} · {exam.totalPoints} points
          </p>
        </div>

        <div role="timer" className="flex w-fit shrink-0 items-center gap-[12px] rounded-[8px] bg-[#eeedf9] px-[20px] py-[12px] text-[#5149b8]">
          <Timer size={18} strokeWidth={1.6} className="shrink-0" />
          <div className="leading-[1.55]">
            <p className="text-[10px]">TIME REMAINING</p>
            <p className="text-[24px] font-semibold tabular-nums">{formatCountdown(secondsLeft)}</p>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-[12px] rounded-[7px] bg-[#eeedf9] p-[16px] text-[#5149b8]">
        <Info size={19} strokeWidth={1.6} className="shrink-0" />
        <div className="flex flex-col gap-[4px] leading-[1.55]">
          <p className="text-[13px] font-semibold">Your attempt ends at {exam.closesAt} GMT</p>
          <p className="text-[12px]">
            Answers save automatically. Your exam is submitted when time runs out, even if questions are unanswered.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[24px] xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Question */}
        <SectionCard
          title={`Question ${currentIndex + 1} of ${questions.length}`}
          action={`${question.points} points`}
        >
          <div>
            <StatusBadge label={question.type} variant="closed" />
          </div>

          <p className="text-[22px] font-semibold leading-[1.55] text-[#202536]">{question.text}</p>

          <div role="radiogroup" aria-label={question.text} className="flex flex-col gap-[12px]">
            {question.options.map((option, optionIndex) => (
              <AnswerOption
                key={option}
                name={question.id}
                marker={String.fromCharCode(65 + optionIndex)}
                label={option}
                isSelected={selectedOption === optionIndex}
                onSelect={() =>
                  setAttempt(recordAnswer(exam.id, attempt, question.id, optionIndex))
                }
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            <Button
              label="← Previous"
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            />
            <p className="order-first w-full text-center text-[12px] leading-[1.55] text-[#6d7180] sm:order-none sm:w-auto">
              {selectedOption === undefined ? "○ No answer selected" : "● Answer selected"}
            </p>
            <Button
              label="Next →"
              variant="secondary"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            />
          </div>
        </SectionCard>

        {/* Progress */}
        <SectionCard title="Your progress">
          <div>
            <p className="text-[26px] font-semibold leading-[1.55] text-[#202536]">
              {answeredCount} / {questions.length}
            </p>
            <p className="text-[12px] leading-[1.55] text-[#6d7180]">questions answered</p>
          </div>

          <div className="h-[5px] overflow-hidden rounded-[3px] bg-[#ededf1]">
            <div
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              className="h-full rounded-[3px] bg-[#5149b8] transition-[width] duration-200"
            />
          </div>

          <div className="flex flex-wrap gap-[7px]">
            {questions.map((item, index) => (
              <QuestionNumber
                key={item.id}
                number={index + 1}
                isCurrent={index === currentIndex}
                isAnswered={answers[item.id] !== undefined}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <p className="text-[11px] leading-[1.55] text-[#6d7180]">
            Filled: answered · Outline: current
          </p>

          <div className="h-px bg-[#e3e4e8]" />

          {savedAt && (
            <div className="flex items-start gap-[7px] text-[#25715b]">
              <CloudCheck size={16} strokeWidth={1.6} className="mt-[2px] shrink-0" />
              <p className="text-[12px] leading-[1.55]">
                All changes saved · {new Date(savedAt).toLocaleTimeString("en-GB")}
              </p>
            </div>
          )}

          <div>
            <Button label="Submit exam" onClick={() => setIsConfirmOpen(true)} />
          </div>

          <p className="text-[11px] leading-[1.55] text-[#6d7180]">
            One attempt. Submission is final.
          </p>
        </SectionCard>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Submit your exam?"
      >
        <div className="flex flex-col gap-[22px]">
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
            You can only submit once. You won't be able to return to your answers.
          </p>

          {unansweredNumbers.length > 0 && (
            <UnansweredNotice questionNumbers={unansweredNumbers} />
          )}

          <div className="flex items-start justify-between gap-[16px] text-[14px] leading-[1.55]">
            <p className="text-[#6d7180]">Answered</p>
            <p className="font-semibold text-[#202536]">
              {answeredCount} of {questions.length} questions
            </p>
          </div>

          <p className="text-[12px] leading-[1.55] text-[#6d7180]">
            Your score and correct answers will be available today at {exam.closesAt} GMT, after the exam closes.
          </p>

          <div className="flex flex-wrap justify-end gap-[12px]">
            <Button label="Keep working" variant="secondary" onClick={() => setIsConfirmOpen(false)} />
            <Button label="Submit exam" onClick={handleSubmit} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StudentExamAttempt() {
  const { examId } = useParams();
  const location = useLocation();
  const { enrolledClasses } = useOutletContext();

  const exam = mockExams.find((item) => item.id === examId);
  const questions = mockExamQuestions[examId];
  const attempt = loadAttempt(examId);

  if (exam?.status !== "open" || !questions) {
    return <Navigate to="/student/exams" replace />;
  }

  // There is only one attempt, so a submitted exam can't be opened again.
  if (attempt?.submittedAt) {
    return <Navigate to={`/student/exams/${examId}/submitted`} replace />;
  }

  // A new attempt only starts once the rules have been accepted.
  if (!attempt && !location.state?.hasAccepted) {
    return <Navigate to={`/student/exams/${examId}/instructions`} replace />;
  }

  const teacher = enrolledClasses.find((item) => item.name === exam.className)?.teacher;

  return (
    <ExamAttempt
      exam={exam}
      questions={questions}
      teacher={teacher}
      initialAttempt={attempt}
    />
  );
}

export default StudentExamAttempt;
