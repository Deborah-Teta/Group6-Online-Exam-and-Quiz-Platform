import { useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ExamAction from "../../components/common/ExamAction";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import { mockExams, mockNextExamNote } from "../../services/studentMockData";
import { averageScore, formatPercent } from "../../utils/scores";

const ALL_CLASSES = "all";

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
        <p className="font-semibold">{exam.title}</p>
        <p className="text-[11px] text-[#6d7180]">{exam.details}</p>
      </div>
    ),
  },
  {
    key: "className",
    header: "Class",
    render: (exam) => <span className="whitespace-nowrap">{exam.className}</span>,
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
    key: "score",
    header: "Score",
    render: (exam) => (exam.score === undefined ? "—" : formatPercent(exam.score)),
  },
  {
    key: "action",
    header: "Action",
    render: (exam) => <ExamAction exam={exam} />,
  },
];

function StudentExams() {
  const { enrolledClasses } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");

  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);
  const requestedClass = searchParams.get("class");
  const activeClass = classNames.includes(requestedClass) ? requestedClass : ALL_CLASSES;

  const openExams = mockExams.filter((exam) => exam.status === "open");
  const upcomingExams = mockExams.filter((exam) => exam.status === "upcoming");
  const completedExams = mockExams.filter((exam) => exam.status === "closed");

  const visibleExams = mockExams.filter(
    (exam) =>
      (activeTab === "all" || exam.status === activeTab) &&
      (activeClass === ALL_CLASSES || exam.className === activeClass),
  );

  const handleClassChange = (event) => {
    const { value } = event.target;
    setSearchParams(value === ALL_CLASSES ? {} : { class: value });
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <p className="text-[30px] leading-[1.2] text-[#202536]">My exams</p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">
          Every exam from your classes, and what you can do next.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="All exams"
          value={mockExams.length}
          subtext={`Across ${enrolledClasses.length} classes`}
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
          title="Completed"
          value={completedExams.length}
          subtext={`Average score ${formatPercent(averageScore(completedExams))}`}
        />
      </div>

      {/* Exams */}
      <SectionCard
        title="Your exams"
        action={
          <label className="flex items-center gap-[8px]">
            Class
            <select
              value={activeClass}
              onChange={handleClassChange}
              className="h-[34px] cursor-pointer rounded-[7px] border border-[#e3e4e8] bg-white px-[8px] text-[12px] text-[#202536] outline-none focus:border-[#5149b8]"
            >
              <option value={ALL_CLASSES}>All classes</option>
              {classNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <Tabs tabs={examTabs} activeTab={activeTab} onChange={setActiveTab} />
        <DataTable
          columns={examColumns}
          rows={visibleExams}
          emptyMessage="No exams match this filter."
        />
      </SectionCard>
    </div>
  );
}

export default StudentExams;
