import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CloudCheck, Info, Timer, TriangleAlert } from "lucide-react";
import Button from "../../components/common/ActionButton";
import Modal from "../../components/common/Modal";
import Notice from "../../components/common/Notice";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { assessmentTypes } from "../../services/studentAssessments";
import {
  getStudentAttempt,
  saveStudentAnswer,
  submitStudentExam,
} from "../../services/studentService";

const formatCountdown = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function AnswerOption({ name, marker, label, isSelected, onSelect }) {
  return (
    <label
      className={`relative flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
        isSelected
          ? "border-primary bg-primary-light"
          : "border-line bg-white hover:bg-slate-50"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={`flex size-[25px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
          isSelected ? "border-primary bg-primary text-white" : "border-line text-main"
        }`}
      >
        {marker}
      </span>
      <span className="min-w-0 text-sm leading-[1.55] text-main">{label}</span>
    </label>
  );
}

function QuestionNumber({ number, isCurrent, isAnswered, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Question ${number}, ${isAnswered ? "answered" : "not answered"}`}
      aria-current={isCurrent ? "step" : undefined}
      className={`flex size-[39px] items-center justify-center rounded-xl border-[1.5px] text-sm font-semibold transition-colors ${
        isCurrent ? "border-primary" : isAnswered ? "border-transparent" : "border-line"
      } ${isAnswered ? "bg-primary-light text-primary" : "bg-white text-muted hover:bg-surface-hover"}`}
    >
      {number}
    </button>
  );
}

function UnansweredNotice({ questionNumbers }) {
  const numberList = new Intl.ListFormat("en-GB").format(questionNumbers.map(String));
  const title =
    questionNumbers.length === 1
      ? "1 question is unanswered"
      : `${questionNumbers.length} questions are unanswered`;

  return (
    <Notice icon={TriangleAlert} title={title} variant="warning">
      {questionNumbers.length === 1 ? "Question" : "Questions"} {numberList} will receive 0 points if you submit now.
    </Notice>
  );
}

function AttemptWorkspace({ assessment, attempt, type, refreshStudentData }) {
  const { noun, basePath } = assessmentTypes[type];
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      attempt.questions.map((question) => [
        question.id,
        question.selectedOptionIndex === null ? undefined : question.selectedOptionIndex,
      ]),
    ),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [now, setNow] = useState(0);
  const [saveError, setSaveError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const automaticSubmitStarted = useRef(false);
  const deadline = new Date(attempt.deadline).getTime();
  const submittedPath = `${basePath}/${assessment.id}/submitted`;
  const questions = attempt.questions;
  const question = questions[currentIndex];
  const selectedOption = answers[question.id];
  const answeredCount = questions.filter(
    (item) => answers[item.id] !== undefined,
  ).length;
  const unansweredNumbers = questions.flatMap((item, index) =>
    answers[item.id] === undefined ? [index + 1] : [],
  );
  const secondsLeft = Math.max(Math.ceil((deadline - now) / 1000), 0);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitStudentExam(attempt.id);
      await refreshStudentData();
      navigate(submittedPath, { replace: true });
    } catch (error) {
      setSubmitError(error.message || `Could not submit your ${noun}.`);
      setIsSubmitting(false);
    }
  }, [attempt.id, isSubmitting, navigate, noun, refreshStudentData, submittedPath]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0 && !automaticSubmitStarted.current) {
      automaticSubmitStarted.current = true;
      handleSubmit();
    }
  }, [handleSubmit, secondsLeft]);

  const handleAnswer = async (optionIndex) => {
    const previousAnswer = answers[question.id];
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
    setSaveError("");
    setIsSaved(false);
    try {
      await saveStudentAnswer(attempt.id, question.id, optionIndex);
      setIsSaved(true);
    } catch (error) {
      setAnswers((current) => ({ ...current, [question.id]: previousAnswer }));
      setSaveError(error.message || "Your answer could not be saved.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-xl font-bold tracking-tight text-main">{assessment.title}</p>
          <p className="text-[13px] text-muted">
            {assessment.className} · {assessment.teacher} · {assessment.totalPoints} points
          </p>
        </div>
        <div role="timer" className="flex w-fit items-center gap-3 rounded-2xl bg-white px-5 py-3 text-primary shadow-sm">
          <Timer size={18} />
          <div className="leading-[1.55]">
            <p className="text-[10px]">TIME REMAINING</p>
            <p className="text-[22px] font-bold tabular-nums">{formatCountdown(secondsLeft)}</p>
          </div>
        </div>
      </div>

      <Notice icon={Info} title={`Your attempt ends at ${assessment.closesTime} CAT`}>
        Answers save automatically. Your {noun} is submitted when time runs out.
      </Notice>

      {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
      {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SectionCard
          title={`Question ${currentIndex + 1} of ${questions.length}`}
          action={`${question.points} points`}
        >
          <StatusBadge
            label={question.type === "true_false" ? "True / false" : "Multiple choice"}
            variant="closed"
          />
          <p className="text-lg font-bold leading-[1.4] text-main">{question.text}</p>
          <div role="radiogroup" aria-label={question.text} className="flex flex-col gap-3">
            {question.options.map((option, optionIndex) => (
              <AnswerOption
                key={`${question.id}-${optionIndex}`}
                name={question.id}
                marker={String.fromCharCode(65 + optionIndex)}
                label={option}
                isSelected={selectedOption === optionIndex}
                onSelect={() => handleAnswer(optionIndex)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              label="← Previous"
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
            />
            <p className="order-first w-full text-center text-xs text-muted sm:order-none sm:w-auto">
              {selectedOption === undefined ? "○ No answer selected" : "● Answer selected"}
            </p>
            <Button
              label="Next →"
              variant="secondary"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((index) => index + 1)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Your progress">
          <div>
            <p className="text-[28px] font-bold text-main">
              {answeredCount} / {questions.length}
            </p>
            <p className="text-xs text-muted">questions answered</p>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-line">
            <div
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              className="h-full bg-primary transition-[width]"
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
          <p className="text-[11px] text-muted">Filled: answered · Outline: current</p>
          <div className="h-px bg-line" />
          {isSaved && (
            <div className="flex items-start gap-2 text-emerald-700">
              <CloudCheck size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs">All changes saved</p>
            </div>
          )}
          <Button
            label={isSubmitting ? "Submitting..." : `Submit ${noun}`}
            disabled={isSubmitting}
            onClick={() => setIsConfirmOpen(true)}
          />
          <p className="text-[11px] text-muted">One attempt. Submission is final.</p>
        </SectionCard>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`Submit your ${noun}?`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-[1.55] text-muted">
            You can only submit once. You won't be able to return to your answers.
          </p>
          {unansweredNumbers.length > 0 && (
            <UnansweredNotice questionNumbers={unansweredNumbers} />
          )}
          <div className="flex items-start justify-between gap-4 text-sm">
            <p className="text-muted">Answered</p>
            <p className="font-bold text-main">{answeredCount} of {questions.length} questions</p>
          </div>
          <p className="text-xs leading-[1.55] text-muted">
            Your score and correct answers will be available after the {noun} closes.
          </p>
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
            <Button
              label="Keep working"
              variant="secondary"
              onClick={() => setIsConfirmOpen(false)}
            />
            <Button
              label={`Submit ${noun}`}
              disabled={isSubmitting}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

function StudentAssessmentAttempt({ type }) {
  const { examId } = useParams();
  const { exams, isLoading, refreshStudentData } = useOutletContext();
  const [attempt, setAttempt] = useState(null);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);
  const [error, setError] = useState("");
  const assessment = exams.find((item) => item.id === examId && item.type === type);
  const { basePath } = assessmentTypes[type];

  useEffect(() => {
    let active = true;
    getStudentAttempt(examId)
      .then((result) => {
        if (active) setAttempt(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load your attempt.");
      })
      .finally(() => {
        if (active) setIsLoadingAttempt(false);
      });

    return () => {
      active = false;
    };
  }, [examId]);

  if (isLoading || isLoadingAttempt) {
    return <p className="py-8 text-center text-sm text-muted">Loading your assessment…</p>;
  }
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (!assessment || !attempt) return <Navigate to={`${basePath}/${examId}/instructions`} replace />;
  if (attempt.status !== "in_progress") {
    return <Navigate to={`${basePath}/${examId}/submitted`} replace />;
  }

  return (
    <AttemptWorkspace
      key={attempt.id}
      assessment={assessment}
      attempt={attempt}
      type={type}
      refreshStudentData={refreshStudentData}
    />
  );
}

export default StudentAssessmentAttempt;
