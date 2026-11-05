import { Send } from "lucide-react";
import ActionButton from "../../common/ActionButton";

function ExamPreview({
  exam,
  teacherClass,
  questions,
  totalPoints,
  questionTypeCounts,
  startLabel,
  endLabel,
  message,
  onAction,
}) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Ready to publish</h2>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
            Draft
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {exam.title || "Untitled exam"}
        </h3>
        <p className="mt-2 text-[11px] text-slate-500">
          {teacherClass
            ? `${teacherClass.name} · ${teacherClass.students} students`
            : "Select a class"}
        </p>

        <div className="my-4 border-t border-slate-100" />

        <dl className="flex flex-col gap-3 text-[11px]">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Questions</dt>
            <dd className="font-semibold text-slate-800">{questions.length}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Total points</dt>
            <dd className="font-semibold text-slate-800">{totalPoints}</dd>
          </div>
          {questionTypeCounts.multipleChoice > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Multiple choice</dt>
              <dd className="font-semibold text-slate-800">
                {questionTypeCounts.multipleChoice}
              </dd>
            </div>
          )}
          {questionTypeCounts.trueFalse > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">True / false</dt>
              <dd className="font-semibold text-slate-800">
                {questionTypeCounts.trueFalse}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Start</dt>
            <dd className="text-right font-semibold text-slate-800">{startLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">End</dt>
            <dd className="text-right font-semibold text-slate-800">{endLabel}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2">
          <ActionButton
            label="Publish exam"
            icon={<Send size={14} />}
            onClick={() => onAction("publish")}
          />
          <ActionButton
            label="Save as draft"
            variant="secondary"
            onClick={() => onAction("draft")}
          />
        </div>

        {message && (
          <p role="status" className="mt-3 text-xs leading-5 text-amber-800">
            {message}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[#dbe7f9] bg-[#EEF3FD] p-4 text-left">
        <p className="text-xs font-semibold text-[#0B609D]">
          One window. One attempt.
        </p>
        <p className="mt-1 text-[11px] leading-5 text-slate-600">
          Students can enter only during the scheduled window. Their attempts
          auto-submit when time ends. Scores and correct answers release at the
          configured time.
        </p>
      </section>
    </div>
  );
}

export default ExamPreview;