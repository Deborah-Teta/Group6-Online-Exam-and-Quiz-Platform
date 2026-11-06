import { useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { CalendarClock, CircleCheck, ClipboardCheck, ClipboardList } from "lucide-react";
import ClassFilter, { ALL_CLASSES } from "../../components/common/ClassFilter";
import DataTable from "../../components/common/DataTable";
import ExamAction from "../../components/common/ExamAction";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import { assessmentTypes } from "../../services/studentAssessments";
import { averageScore, formatPercent } from "../../utils/scores";

const buildTabs = () => [
  { label: "All exams", value: "all" },
  { label: "Open", value: "open" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "closed" },
];

const buildColumns = (type) => [
  {
    key: "title",
    header: "Exam",
    render: (item) => (
      <div className="flex flex-col gap-[4px]">
        <p className="text-sm font-bold text-slate-900">{item.title}</p>
        <p className="text-xs text-slate-500">{item.details}</p>
      </div>
    ),
  },
  {
    key: "className",
    header: "Class",
    render: (item) => <span className="whitespace-nowrap">{item.className}</span>,
  },
  {
    key: "schedule",
    header: "Schedule · CAT",
    render: (item) => <span className="whitespace-nowrap">{item.schedule}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (item) => <StatusBadge label={item.statusLabel} variant={item.status} />,
  },
  {
    key: "score",
    header: "Score",
    render: (item) => (item.score === undefined ? "—" : formatPercent(item.score)),
  },
  {
    key: "action",
    header: "Action",
    render: (item) => <ExamAction exam={item} type="exam" />,
  },
];

function StudentAssessments({ type = "exam" }) {
  const { enrolledClasses, exams, isLoading } = useOutletContext();
  const items = exams;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");

  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);
  const requestedClass = searchParams.get("class");
  const activeClass = classNames.includes(requestedClass) ? requestedClass : ALL_CLASSES;

  const openItems = items.filter((item) => item.status === "open");
  const upcomingItems = items.filter((item) => item.status === "upcoming");
  const completedItems = items.filter((item) => item.status === "closed");

  const visibleItems = items.filter(
    (item) =>
      (activeTab === "all" || item.status === activeTab) &&
      (activeClass === ALL_CLASSES || item.className === activeClass),
  );

  const handleClassChange = (value) => {
    setSearchParams(value === ALL_CLASSES ? {} : { class: value });
  };

  return (
    <>
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList size={28} className="text-[#5149B8]" />}
          title="All exams"
          value={isLoading ? "…" : items.length}
          subtext={`Across ${enrolledClasses.length} classes`}
        />
        <StatCard
          icon={<ClipboardCheck size={28} className="text-[#5149B8]" />}
          title="Open now"
          value={openItems.length}
          subtext={
            openItems[0]
              ? `${openItems[0].title} closes at ${openItems[0].closesTime}`
              : "No assessments open right now"
          }
        />
        <StatCard
          icon={<CalendarClock size={28} className="text-[#5149B8]" />}
          title="Coming up"
          value={upcomingItems.length}
          subtext={
            upcomingItems[0]
              ? `${upcomingItems[0].title} · ${upcomingItems[0].schedule}`
              : "Nothing scheduled"
          }
        />
        <StatCard
          icon={<CircleCheck size={28} className="text-[#5149B8]" />}
          title="Completed"
          value={completedItems.length}
          subtext={`Average score ${formatPercent(averageScore(completedItems))}`}
        />
      </div>

      {/* List */}
      <SectionCard
        title="Your exams"
       
        action={
          <ClassFilter
            classNames={classNames}
            value={activeClass}
            onChange={handleClassChange}
          />
        }
      >
        <Tabs tabs={buildTabs()} activeTab={activeTab} onChange={setActiveTab} />
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted">
            Loading your exams…
          </p>
        ) : (
          <DataTable
            columns={buildColumns("exam")}
            rows={visibleItems}
            emptyMessage="No exams match this filter."
          />
        )}
      </SectionCard>
    </>
  );
}

export default StudentAssessments;
