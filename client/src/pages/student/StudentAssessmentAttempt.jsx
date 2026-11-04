import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CloudCheck, Info, Timer, TriangleAlert } from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Notice from "../../components/common/Notice";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import {
  loadAttempt,
  recordAnswer,
  startAttempt,
  submitAttempt,
} from "../../services/studentAttempts";
import { assessmentTypes } from "../../services/studentAssessments";

const formatCountdown = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function AnswerOption({ name, marker, label, isSelected, onSelect }) {
  return (
    <label
      className={`
        relative flex min-h-[48px] cursor-pointer items-center gap-[12px] rounded-sm border p-[14px]
        transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary
        ${
          isSelected
            ? "border-primary bg-primary-light"
            : "border-line bg-white hover:bg-surface-hover"
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
              ? "border-primary bg-primary text-white"
              : "border-line text-main"
          }
        `}
      >
        {marker}
      </span>
      <span className="min-w-0 text-[14px] leading-[1.55] text-main">{label}</span>
    </label>
  );
}

function QuestionNumber({ number, isCurrent, isAnswered, onClick }) {
  const borderColor = isCurrent
    ? "border-primary"
    : isAnswered
      ? "border-transparent"
      : "border-line";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Question ${number}, ${isAnswered ? "answered" : "not answered"}`}
      aria-current={isCurrent ? "step" : undefined}
      className={`
        flex size-[39px] cursor-pointer items-center justify-center rounded-sm border-[1.5px]
        text-[14px] font-semibold leading-[1.55] transition-colors
        ${borderColor}
        ${isAnswered ? "bg-primary-light" : "bg-white hover:bg-surface-hover"}
        ${isAnswered || isCurrent ? "text-primary" : "text-muted"}
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
    <Notice
      icon={TriangleAlert}
      title={isSingle ? "1 question is unanswered" : `${questionNumbers.length} questions are unanswered`}
      variant="warning"
    >
      {isSingle ? "Question" : "Questions"} {numberList} will receive 0 points if you submit now.
    </Notice>
  );
}

function AttemptWorkspace({ assessment, config, teacher, initialAttempt }) {
  const { noun, basePath } = config;
  const questions = config.questions[assessment.id];
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(
    () => initialAttempt ?? startAttempt(assessment.id, assessment.durationMinutes),
  );
  const [now, setNow] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { deadline, answers, savedAt } = attempt;
  const submittedPath = `${basePath}/${assessment.id}/submitted`;

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);

      // Time is up, so whatever has been saved is submitted automatically.
      if (current >= deadline) {
        submitAttempt(assessment.id, { automatic: true });
        navigate(submittedPath, { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, assessment.id, navigate, submittedPath]);

  const question = questions[currentIndex];
  const selectedOption = answers[question.id];
  const answeredCount = questions.filter((item) => answers[item.id] !== undefined).length;
  const unansweredNumbers = questions.flatMap((item, index) =>
    answers[item.id] === undefined ? [index + 1] : [],
  );
  const secondsLeft = Math.max(Math.ceil((deadline - now) / 1000), 0);

  const handleSubmit = () => {
    submitAttempt(assessment.id);
    navigate(submittedPath, { replace: true });
  };

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between sm:gap-[24px]">
        <div className="flex min-w-0 flex-col gap-[6px]">
          <p className="text-[20px] font-bold leading-[1.3] tracking-[-0.3px] text-main">{assessment.title}</p>
          <p className="text-[13px] leading-normal text-muted">
            {assessment.className} · {teacher} · {assessment.totalPoints} points
          </p>
        </div>

        <div role="timer" className="flex w-fit shrink-0 items-center gap-[12px] rounded-md border border-primary-border bg-primary-light px-[16px] py-[10px] text-primary">
          <Timer size={18} strokeWidth={1.6} className="shrink-0" />
          <div className="leading-[1.55]">
            <p className="text-[10px]">TIME REMAINING</p>
            <p className="text-[22px] font-bold tabular-nums">{formatCountdown(secondsLeft)}</p>
          </div>
        </div>
      </div>

      {/* Notice */}
      <Notice icon={Info} title={`Your attempt ends at ${assessment.closesAt} GMT`}>
        Answers save automatically. Your {noun} is submitted when time runs out, even if questions are unanswered.
      </Notice>

      <div className="grid grid-cols-1 items-start gap-[24px] xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Question */}
        <SectionCard
          title={`Question ${currentIndex + 1} of ${questions.length}`}
          action={`${question.points} points`}
        >
          <div>
            <StatusBadge label={question.type} variant="closed" />
          </div>

          <p className="text-[18px] font-bold leading-[1.4] text-main">{question.text}</p>

          <div role="radiogroup" aria-label={question.text} className="flex flex-col gap-[12px]">
            {question.options.map((option, optionIndex) => (
              <AnswerOption
                key={option}
                name={question.id}
                marker={String.fromCharCode(65 + optionIndex)}
                label={option}
                isSelected={selectedOption === optionIndex}
                onSelect={() =>
                  setAttempt(recordAnswer(assessment.id, attempt, question.id, optionIndex))
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
            <p className="order-first w-full text-center text-[12px] leading-[1.55] text-muted sm:order-none sm:w-auto">
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
            <p className="text-[28px] font-bold leading-[1.2] tracking-[-0.5px] text-main">
              {answeredCount} / {questions.length}
            </p>
            <p className="text-[12px] leading-[1.55] text-muted">questions answered</p>
          </div>

          <div className="h-[5px] overflow-hidden rounded-full bg-line">
            <div
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              className="h-full rounded-full bg-primary transition-[width] duration-200"
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

          <p className="text-[11px] leading-[1.55] text-muted">
            Filled: answered · Outline: current
          </p>

          <div className="h-px bg-line" />

          {savedAt && (
            <div className="flex items-start gap-[7px] text-[var(--color-success-text)]">
              <CloudCheck size={16} strokeWidth={1.6} className="mt-[2px] shrink-0" />
              <p className="text-[12px] leading-[1.55]">
                All changes saved · {new Date(savedAt).toLocaleTimeString("en-GB")}
              </p>
            </div>
          )}

          <div>
            <Button label={`Submit ${noun}`} onClick={() => setIsConfirmOpen(true)} />
          </div>

          <p className="text-[11px] leading-[1.55] text-muted">
            One attempt. Submission is final.
          </p>
        </SectionCard>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`Submit your ${noun}?`}
        footer={
          <>
            <Button label="Keep working" variant="secondary" onClick={() => setIsConfirmOpen(false)} />
            <Button label={`Submit ${noun}`} onClick={handleSubmit} />
          </>
        }
      >
        <div className="flex flex-col gap-[16px]">
          <p className="text-[14px] leading-[1.55] text-muted">
            You can only submit once. You won't be able to return to your answers.
          </p>

          {unansweredNumbers.length > 0 && (
            <UnansweredNotice questionNumbers={unansweredNumbers} />
          )}

          <div className="flex items-start justify-between gap-[16px] text-[14px] leading-[1.55]">
            <p className="text-muted">Answered</p>
            <p className="font-semibold text-main">
              {answeredCount} of {questions.length} questions
            </p>
          </div>

          <p className="text-[12px] leading-[1.55] text-muted">
            Your score and correct answers will be available today at {assessment.closesAt} GMT, after the {noun} closes.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function StudentAssessmentAttempt({ type }) {
  const config = assessmentTypes[type];
  const { items, basePath } = config;

  const { examId } = useParams();
  const location = useLocation();
  const { enrolledClasses } = useOutletContext();

  const assessment = items.find((item) => item.id === examId);
  const questions = config.questions[examId];
  const attempt = loadAttempt(examId);

  if (assessment?.status !== "open" || !questions) {
    return <Navigate to={basePath} replace />;
  }

  // There is only one attempt, so a submitted one can't be opened again.
  if (attempt?.submittedAt) {
    return <Navigate to={`${basePath}/${examId}/submitted`} replace />;
  }

  // A new attempt only starts once the rules have been accepted.
  if (!attempt && !location.state?.hasAccepted) {
    return <Navigate to={`${basePath}/${examId}/instructions`} replace />;
  }

  const teacher = enrolledClasses.find((item) => item.name === assessment.className)?.teacher;

  return (
    <AttemptWorkspace
      assessment={assessment}
      config={config}
      teacher={teacher}
      initialAttempt={attempt}
    />
  );
}

export default StudentAssessmentAttempt;
