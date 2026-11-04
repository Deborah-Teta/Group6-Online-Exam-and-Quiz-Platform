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

const buildTabs = ({ plural }) => [
  { label: `All ${plural}`, value: "all" },
  { label: "Open", value: "open" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "closed" },
];

const buildColumns = ({ nounTitle }, type) => [
  {
    key: "title",
    header: nounTitle,
    render: (item) => (
      <div className="flex flex-col gap-[4px]">
        <p className="font-semibold">{item.title}</p>
        <p className="text-[11px] text-muted">{item.details}</p>
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
    header: "Schedule · GMT",
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
    render: (item) => <ExamAction exam={item} type={type} />,
  },
];

function StudentAssessments({ type }) {
  const config = assessmentTypes[type];
  const { items, plural, nextNote } = config;

  const { enrolledClasses } = useOutletContext();
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
    <div className="flex flex-col gap-[24px]">
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ClipboardList size={20} strokeWidth={1.6} />}
          color="indigo"
          title={`All ${plural}`}
          value={items.length}
          subtext={`Across ${enrolledClasses.length} classes`}
        />
        <StatCard
          icon={<ClipboardCheck size={20} strokeWidth={1.6} />}
          color="emerald"
          title="Open now"
          value={openItems.length}
          subtext={`${openItems[0].title} closes at ${openItems[0].closesAt}`}
        />
        <StatCard
          icon={<CalendarClock size={20} strokeWidth={1.6} />}
          color="blue"
          title="Coming up"
          value={upcomingItems.length}
          subtext={nextNote}
        />
        <StatCard
          icon={<CircleCheck size={20} strokeWidth={1.6} />}
          color="purple"
          title="Completed"
          value={completedItems.length}
          subtext={`Average score ${formatPercent(averageScore(completedItems))}`}
        />
      </div>

      {/* List */}
      <SectionCard
        title={`Your ${plural}`}
        flush
        action={
          <ClassFilter
            classNames={classNames}
            value={activeClass}
            onChange={handleClassChange}
          />
        }
      >
        <Tabs tabs={buildTabs(config)} activeTab={activeTab} onChange={setActiveTab} />
        <DataTable
          columns={buildColumns(config, type)}
          rows={visibleItems}
          emptyMessage={`No ${plural} match this filter.`}
        />
      </SectionCard>
    </div>
  );
}

export default StudentAssessments;
