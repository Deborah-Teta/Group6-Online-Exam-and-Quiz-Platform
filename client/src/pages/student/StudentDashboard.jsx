import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import BarChart from "../../components/common/BarChart";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import LineChart from "../../components/common/LineChart";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import {
  mockExams,
  mockNextExamNote,
  mockStudent,
} from "../../services/studentMockData";
import { averageScore, formatPercent } from "../../utils/scores";

const VISIBLE_ROWS = 5;

const examTabs = [
  { label: "All exams", value: "all" },
  { label: "Open", value: "open" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "closed" },
];

function ExamAction({ exam }) {
  const navigate = useNavigate();

  if (exam.status === "open") {
    return <Button label="View exam →" onClick={() => navigate("/student/exams")} />;
  }

  if (exam.status === "closed") {
    return (
      <Link to="/student/results" className="text-[12px] whitespace-nowrap text-[#5149b8] hover:underline">
        View results →
      </Link>
    );
  }

  return <span className="text-[12px] whitespace-nowrap text-[#6d7180]">{exam.availability}</span>;
}

const examColumns = [
  {
    key: "title",
    header: "Exam",
    render: (exam) => (
      <div className="flex flex-col gap-[4px]">
        <p className="font-semibold">{exam.title}</p>
        <p className="text-[11px] text-[#6d7180]">{exam.className}</p>
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
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <p className="text-[30px] leading-[1.2] text-[#202536]">
          Ready when you are, {mockStudent.name.split(" ")[0]}.
        </p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">
          Your classes and exams, all in one place.
        </p>
      </div>

      {/* Row 1: statistics */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My classes"
          value={enrolledClasses.length}
          subtext={classNames.join(" · ")}
        />
        <StatCard
          title="Open now"
          value={openExams.length}
          subtext={`${openExams[0].title} closes at ${openExams[0].closesAt}`}
        />
        <StatCard
          title="Coming up"
          value={upcomingExams.length}
          subtext={mockNextExamNote}
        />
        <StatCard
          title="Average score"
          value={formatPercent(averageScore(completedExams))}
          subtext={`Across ${completedExams.length} completed exams`}
        />
      </div>

      {/* Row 2: charts */}
      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-3">
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
      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-3">
        <SectionCard
          title="Your exams"
          action={
            <Link to="/student/exams" className="text-[#5149b8] hover:underline">
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
            <Link to="/student/results" className="text-[#5149b8] hover:underline">
              View all →
            </Link>
          }
        >
          <ul className="flex flex-1 flex-col justify-between divide-y divide-[#e3e4e8]">
            {completedExams.slice(0, VISIBLE_ROWS).map((exam) => (
              <li key={exam.id} className="flex items-center justify-between gap-[12px] py-[14px]">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-[1.55] text-[#202536]">
                    {exam.title}
                  </p>
                  <p className="text-[11px] leading-[1.55] text-[#6d7180]">
                    {exam.className} · {exam.date}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-semibold leading-normal text-[#202536]">
                  {formatPercent(exam.score)}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

export default StudentDashboard;
