import { useEffect, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Check, LockKeyhole } from "lucide-react";
import Button from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Notice from "../../components/common/Notice";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { assessmentTypes } from "../../services/studentAssessments";
import { getStudentAttempt, getStudentAttemptResult } from "../../services/studentService";
import { formatPercent } from "../../utils/scores";

const formatSubmittedAt = (timestamp) => {
  if (!timestamp) return "Submitted";
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kigali",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
  });
  return `${day} · ${time} CAT`;
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
  const [detailedResult, setDetailedResult] = useState(null);
  const [detailedResultError, setDetailedResultError] = useState("");
  const navigate = useNavigate();
  const assessment = exams.find((item) => item.id === examId && item.type === type);
  const loadingDetailedResult = Boolean(
    attempt?.id && attempt?.resultReleased && !detailedResult && !detailedResultError,
  );

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

  useEffect(() => {
    if (!attempt?.id || !attempt?.resultReleased) return undefined;

    let active = true;
    getStudentAttemptResult(attempt.id)
      .then((result) => {
        if (active) setDetailedResult(result);
      })
      .catch((requestError) => {
        if (active) {
          setDetailedResultError(
            requestError.message || "Could not load question answers and explanations.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [attempt?.id, attempt?.resultReleased]);

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
                {assessment.closesTime} CAT · Results unlock after the assessment closes.
              </p>
              <StatusBadge label="Not yet available" variant="closed" />
            </>
          )}
        </SectionCard>
      </div>

      {loadingDetailedResult && (
        <p className="py-6 text-center text-sm text-muted">Loading question answers and explanations…</p>
      )}
      {detailedResultError && (
        <p role="alert" className="py-6 text-center text-sm text-red-600">
          {detailedResultError}
        </p>
      )}

      {detailedResult?.answers?.length > 0 && (
        <SectionCard title="Question Breakdown & Explanations" action={`${detailedResult.answers.length} questions`}>
          <div className="flex flex-col gap-5">
            {detailedResult.answers.map((ans, idx) => (
              <div
                key={ans.questionId || idx}
                className={`rounded-2xl border p-4 ${
                  ans.isCorrect ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">
                    Question {idx + 1}: {ans.questionText}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ans.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ans.isCorrect ? `+${ans.awardedPoints} pts (Correct)` : "0 pts (Incorrect)"}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {ans.options?.map((opt, optIdx) => {
                    const isSelected = ans.selectedOptionIndex === optIdx;
                    const isCorrectOption = ans.correctOptionIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                          isCorrectOption
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : isSelected
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                        <span>{opt}</span>
                        {isSelected && <span className="ml-auto font-bold">(Your answer)</span>}
                        {isCorrectOption && !isSelected && (
                          <span className="ml-auto font-bold text-emerald-700">(Correct answer)</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {ans.explanation && (
                  <p className="mt-3 rounded-lg bg-white/80 p-2.5 text-xs text-slate-600 border border-slate-200/60">
                    <span className="font-bold text-slate-800">Explanation: </span>
                    {ans.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  );
}

export default StudentAssessmentSubmitted;
