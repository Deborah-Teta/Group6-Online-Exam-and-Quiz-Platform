import ActionButton from "../../common/ActionButton";
import Card from "../../common/Card";
import DataTable from "../../common/DataTable";

const studentColumns = (totalPoints) => [
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
    render: (student) =>
      student.score === null || student.score === undefined
        ? "—"
        : `${student.score} / ${totalPoints ?? 0}`,
  },
  {
    key: "percent",
    header: "Percent",
    render: (student) => student.percent === null ? "—" : `${student.percent}%`,
  },
  {
    key: "submittedAt",
    header: "Submitted · CAT",
  },
  {
    key: "status",
    header: "Status",
    render: (student) => student.status === "in_progress"
      ? "In progress"
      : student.status === "auto_submitted"
        ? "Auto-submitted"
        : "Submitted",
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
            {exam.className || "Class"} · {exam.date} · {exam.schedule} ·{" "}
            {exam.questionCount ?? 0} questions · {exam.totalPoints ?? 0} points
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
          value={`${exam.average ?? 0}%`}
          detail={`${exam.averageScore ?? 0} out of ${exam.totalPoints ?? 0} points`}
        />
        <SummaryCard
          label="Submitted"
          value={`${exam.submittedCount ?? 0} / ${exam.classStudentCount ?? 1}`}
          detail={`${(exam.classStudentCount ?? 0) > 0 ? Math.round(((exam.submittedCount ?? 0) / exam.classStudentCount) * 100) : 0}% class participation`}
        />
        <SummaryCard
          label="Highest score"
          value={`${exam.highestScore ?? 0} / ${exam.totalPoints ?? 0}`}
          detail={`${exam.fullMarkCount ?? 0} ${(exam.fullMarkCount ?? 0) === 1 ? "student" : "students"} earned full marks`}
        />
        <SummaryCard
          label="Still in progress"
          value={exam.inProgressCount ?? 0}
          detail="Attempts not yet submitted"
        />
      </section>

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
        <Card className="min-w-0 p-4 sm:p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Student scores</h2>
            <span className="text-[11px] text-slate-500">
              {exam.students.length} started attempts
            </span>
          </div>

          <DataTable
            columns={studentColumns(exam.totalPoints)}
            rows={exam.students}
            emptyMessage="No submitted attempts yet."
          />

          <p className="mt-3 text-[10px] leading-5 text-slate-500">
            Scores reflect submitted attempts; in-progress attempts are not included in the class average.
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
            Correct-answer rates are calculated from submitted attempts.
          </p>

          <div className="flex flex-col divide-y divide-slate-100">
            {exam.questions.map((question, index) => {
              const percent = question.correctPercentage;
              const needsReview = percent < 70;

              return (
                <div key={question.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold text-slate-800">
                      Q{index + 1} · {question.topic}
                    </p>
                    <span
                      className={`shrink-0 text-[10px] font-semibold ${
                        needsReview ? "text-amber-700" : "text-[#5149B8]"
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
                        needsReview ? "bg-amber-600" : "bg-[#5149B8]"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {question.correctCount} of {question.totalStudents} students
                    correct
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <Card className="flex items-start gap-3 bg-[#FFFFFF] p-4">
        <span className="text-[#5149B8]" aria-hidden="true">▣</span>
        <div>
          <p className="text-xs font-semibold text-slate-700">
            {exam.reviewQuestions.length
              ? "Questions students found most challenging"
              : "Question performance"}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            {exam.submittedCount === 0
              ? "There are no submitted attempts to analyze yet."
              : exam.reviewQuestions.length
                ? exam.reviewQuestions
                    .map((question) => `${question.topic} (${Math.round(question.correctPercentage)}% correct)`)
                    .join(" · ")
                : "Every question was answered correctly by at least 70% of submitted students."}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default ExamResults;