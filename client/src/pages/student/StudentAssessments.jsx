import { useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ExamAction from "../../components/common/ExamAction";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import { assessmentTypes } from "../../services/studentAssessments";
import { averageScore, formatPercent } from "../../utils/scores";

const ALL_CLASSES = "all";

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
        <p className="text-[11px] text-[#6d7180]">{item.details}</p>
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
  const { items, noun, plural, nextNote } = config;

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

  const handleClassChange = (event) => {
    const { value } = event.target;
    setSearchParams(value === ALL_CLASSES ? {} : { class: value });
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <p className="text-[30px] leading-[1.2] text-[#202536]">My {plural}</p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">
          Every {noun} from your classes, and what you can do next.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={`All ${plural}`}
          value={items.length}
          subtext={`Across ${enrolledClasses.length} classes`}
        />
        <StatCard
          title="Open now"
          value={openItems.length}
          subtext={`${openItems[0].title} closes at ${openItems[0].closesAt}`}
        />
        <StatCard
          title="Coming up"
          value={upcomingItems.length}
          subtext={nextNote}
        />
        <StatCard
          title="Completed"
          value={completedItems.length}
          subtext={`Average score ${formatPercent(averageScore(completedItems))}`}
        />
      </div>

      {/* List */}
      <SectionCard
        title={`Your ${plural}`}
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
