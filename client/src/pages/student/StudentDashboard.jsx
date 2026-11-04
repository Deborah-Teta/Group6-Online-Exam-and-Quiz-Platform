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
import {
  mockExams,
  mockNextExamNote,
} from "../../services/studentMockData";
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
    header: "Schedule · GMT",
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
  const { enrolledClasses } = useOutletContext();
  const [activeTab, setActiveTab] = useState("all");

  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);
  const openExams = mockExams.filter((exam) => exam.status === "open");
  const upcomingExams = mockExams.filter((exam) => exam.status === "upcoming");
  const completedExams = mockExams.filter((exam) => exam.status === "closed");
  const visibleExams = (
    activeTab === "all"
      ? mockExams
      : mockExams.filter((exam) => exam.status === activeTab)
  ).slice(0, VISIBLE_ROWS);

  const scoreTrend = [...completedExams].reverse().map((exam) => ({
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
          icon={<Users size={28} className="text-[#0B609D]" />}
          title="My classes"
          value={enrolledClasses.length}
          subtext={classNames.join(" · ")}
        />
        <StatCard
          icon={<ClipboardCheck size={28} className="text-[#0B609D]" />}
          title="Open now"
          value={openExams.length}
          subtext={`${openExams[0].title} closes at ${openExams[0].closesAt}`}
        />
        <StatCard
          icon={<CalendarClock size={28} className="text-[#0B609D]" />}
          title="Coming up"
          value={upcomingExams.length}
          subtext={mockNextExamNote}
        />
        <StatCard
          icon={<ChartNoAxesCombined size={28} className="text-[#0B609D]" />}
          title="Average score"
          value={formatPercent(averageScore(completedExams))}
          subtext={`Across ${completedExams.length} completed exams`}
        />
      </div>

      {/* Row 2: charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Score trend" action="Completed exams" className="xl:col-span-2">
          <LineChart
            data={scoreTrend}
            label="Score on each completed exam, oldest to newest"
            formatValue={formatPercent}
          />
        </SectionCard>

        <SectionCard title="Average score by class">
          <BarChart
            data={scoreByClass}
            label="Average score by class"
            formatValue={formatPercent}
          />
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
          <DataTable
            columns={examColumns}
            rows={visibleExams}
            emptyMessage="No exams here yet."
          />
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
            {completedExams.slice(0, VISIBLE_ROWS).map((exam) => (
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
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

export default StudentDashboard;
