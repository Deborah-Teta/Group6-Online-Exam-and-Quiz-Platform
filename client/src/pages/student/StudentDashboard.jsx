import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ChartNoAxesCombined, CalendarClock, ClipboardCheck, Users } from "lucide-react";
import BarChart from "../../components/common/BarChart";
import DataTable from "../../components/common/DataTable";
import ExamAction from "../../components/common/ExamAction";
import LineChart from "../../components/common/LineChart";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import { averageScore, formatPercent } from "../../utils/scores";

const VISIBLE_ROWS = 5;

const examTabs = [
  { label: "All exams", value: "all" },
  { label: "Open", value: "open" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "closed" },
];

const examColumns = [
  {
    key: "title",
    header: "Exam",
    render: (exam) => (
      <div className="flex flex-col gap-[4px]">
        <p className="text-sm font-bold text-slate-900">{exam.title}</p>
        <p className="text-xs text-slate-500">{exam.className}</p>
      </div>
    ),
  },
  {
    key: "schedule",
    header: "Schedule · CAT",
    render: (exam) => <span className="whitespace-nowrap">{exam.schedule}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (exam) => <StatusBadge label={exam.statusLabel} variant={exam.status} />,
  },
  {
    key: "action",
    header: "Action",
    render: (exam) => <ExamAction exam={exam} />,
  },
];

function StudentDashboard() {
  const { enrolledClasses, exams, isLoading } = useOutletContext();
  const [activeTab, setActiveTab] = useState("all");

  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);
  const studentExams = exams;
  const openExams = studentExams.filter((exam) => exam.status === "open");
  const upcomingExams = studentExams.filter((exam) => exam.status === "upcoming");
  const completedExams = studentExams.filter(
    (exam) => exam.status === "closed" && exam.score !== undefined,
  );
  const visibleExams = (
    activeTab === "all"
      ? studentExams
      : studentExams.filter((exam) => exam.status === activeTab)
  ).slice(0, VISIBLE_ROWS);

  const scoreTrend = completedExams.map((exam) => ({
    label: exam.date,
    value: exam.score,
    detail: exam.title,
  }));

  const scoreByClass = classNames
    .map((name) => ({
      name,
      classExams: completedExams.filter((exam) => exam.className === name),
    }))
    .filter(({ classExams }) => classExams.length > 0)
    .map(({ name, classExams }) => ({
      label: name,
      value: averageScore(classExams),
      detail: `${classExams.length} exams`,
    }));

  return (
    <>
      {/* Row 1: statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={28} className="text-[#5149B8]" />}
          title="My classes"
          value={isLoading ? "…" : enrolledClasses.length}
          subtext={classNames.join(" · ") || "Join a class to get started"}
        />
        <StatCard
          icon={<ClipboardCheck size={28} className="text-[#5149B8]" />}
          title="Open now"
          value={isLoading ? "…" : openExams.length}
          subtext={
            openExams[0]
              ? `${openExams[0].title} closes at ${openExams[0].closesTime}`
              : "No assessments open right now"
          }
        />
        <StatCard
          icon={<CalendarClock size={28} className="text-[#5149B8]" />}
          title="Coming up"
          value={isLoading ? "…" : upcomingExams.length}
          subtext={
            upcomingExams[0]
              ? `${upcomingExams[0].title} · ${upcomingExams[0].schedule}`
              : "Nothing scheduled"
          }
        />
        <StatCard
          icon={<ChartNoAxesCombined size={28} className="text-[#5149B8]" />}
          title="Average score"
          value={
            completedExams.length
              ? formatPercent(averageScore(completedExams))
              : "—"
          }
          subtext={`Across ${completedExams.length} released results`}
        />
      </div>

      {/* Row 2: charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Score trend" action="Completed exams" className="xl:col-span-2">
          {scoreTrend.length ? (
            <LineChart
              data={scoreTrend}
              label="Score on each completed exam, oldest to newest"
              formatValue={formatPercent}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              Scores will appear here after you complete an exam.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Average score by class">
          {scoreByClass.length ? (
            <BarChart
              data={scoreByClass}
              label="Average score by class"
              formatValue={formatPercent}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              No released scores to compare yet.
            </p>
          )}
        </SectionCard>
      </div>

      {/* Row 3: exams and results */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="Your exams"
         
          action={
            <Link to="/student/exams" className="text-primary hover:underline">
              View all exams →
            </Link>
          }
          className="xl:col-span-2"
        >
          <Tabs tabs={examTabs} activeTab={activeTab} onChange={setActiveTab} />
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted">Loading your exams…</p>
          ) : (
            <DataTable
              columns={examColumns}
              rows={visibleExams}
              emptyMessage="No exams here yet."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Recent results"
          action={
            <Link to="/student/results" className="text-primary hover:underline">
              View all →
            </Link>
          }
        >
          <ul className="-my-[14px] flex flex-1 flex-col justify-between divide-y divide-line-subtle">
            {[...completedExams].reverse().slice(0, VISIBLE_ROWS).map((exam) => (
              <li key={exam.id} className="flex items-center justify-between gap-[12px] py-[14px]">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-[1.55] text-main">
                    {exam.title}
                  </p>
                  <p className="text-[11px] leading-[1.55] text-muted">
                    {exam.className} · {exam.date}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-semibold leading-normal text-main">
                  {formatPercent(exam.score)}
                </p>
              </li>
            ))}
            {!isLoading && completedExams.length === 0 && (
              <li className="py-6 text-center text-sm text-muted">
                No released results yet.
              </li>
            )}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

export default StudentDashboard;
