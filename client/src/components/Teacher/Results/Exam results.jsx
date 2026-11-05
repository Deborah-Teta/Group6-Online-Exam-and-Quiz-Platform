import ActionButton from "../../common/ActionButton";
import Card from "../../common/Card";
import DataTable from "../../common/DataTable";

const studentColumns = [
  {
    key: "student",
    header: "Student",
    render: (student) => (
      <div>
        <p className="font-semibold text-slate-800">{student.name}</p>
        <p className="mt-1 text-[10px] text-slate-500">{student.submission}</p>
      </div>
    ),
  },
  {
    key: "score",
    header: "Score",
    render: (student) => `${student.score} / 10`,
  },
  {
    key: "percent",
    header: "Percent",
    render: (student) => `${student.percent}%`,
  },
  {
    key: "submittedAt",
    header: "Submitted · GMT",
  },
];

function SummaryCard({ label, value, detail }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
    </Card>
  );
}

function ExamResults({ exam, onExport }) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {exam.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {exam.className} · {exam.date} · {exam.schedule} ·{" "}
            {exam.questionCount} questions · {exam.totalPoints} points
          </p>
        </div>

        <ActionButton
          label="Export results"
          variant="secondary"
          onClick={onExport}
        />
      </header>

      <section
        aria-label="Exam summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          label="Class average"
          value={`${exam.average}%`}
          detail={`${exam.averageScore} out of ${exam.totalPoints} points`}
        />
        <SummaryCard
          label="Submitted"
          value={`${exam.students.length} / ${exam.students.length}`}
          detail="100% participation"
        />
        <SummaryCard
          label="Highest score"
          value={`${exam.highestScore} / ${exam.totalPoints}`}
          detail={`${exam.fullMarkCount} students earned full marks`}
        />
        <SummaryCard
          label="Result status"
          value={exam.resultStatus}
          detail={`Available since ${exam.releaseTime}`}
        />
      </section>

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
        <Card className="min-w-0 p-4 sm:p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Student scores</h2>
            <span className="text-[11px] text-slate-500">
              {exam.students.length} students
            </span>
          </div>

          <DataTable
            columns={studentColumns}
            rows={exam.students}
            emptyMessage="No submitted attempts yet."
          />

          <p className="mt-3 text-[10px] leading-5 text-slate-500">
            All attempts are final. Select a student to inspect their answers.
          </p>
        </Card>

        <Card className="min-w-0 p-4 sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">
              Question statistics
            </h2>
            <span className="text-[10px] text-slate-500">% correct</span>
          </div>

          <p className="mb-4 text-[10px] leading-5 text-slate-500">
            Identify concepts to revisit. Each question is worth{" "}
            {exam.pointsPerQuestion} points.
          </p>

          <div className="flex flex-col divide-y divide-slate-100">
            {exam.questions.map((question, index) => {
              const percent = Math.round(
                (question.correctCount / exam.students.length) * 100,
              );
              const needsReview = percent < 70;

              return (
                <div key={question.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold text-slate-800">
                      Q{index + 1} · {question.topic}
                    </p>
                    <span
                      className={`shrink-0 text-[10px] font-semibold ${
                        needsReview ? "text-amber-700" : "text-[#0B609D]"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    {question.questionText}
                  </p>

                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${percent}% answered correctly`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full ${
                        needsReview ? "bg-amber-600" : "bg-[#0B609D]"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {question.correctCount} of {exam.students.length} students
                    correct
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <Card className="flex items-start gap-3 bg-[#EEF3FD] p-4">
        <span className="text-[#0B609D]" aria-hidden="true">▣</span>
        <div>
          <p className="text-xs font-semibold text-slate-700">
            A useful next lesson: {exam.lessonSuggestion}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            {exam.lessonNote}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default ExamResults;