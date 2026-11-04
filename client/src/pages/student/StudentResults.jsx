import { useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import BarChart from "../../components/common/BarChart";
import ClassFilter, { ALL_CLASSES } from "../../components/common/ClassFilter";
import DataTable from "../../components/common/DataTable";
import LineChart from "../../components/common/LineChart";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import { assessmentTypes } from "../../services/studentAssessments";
import { loadAttempt } from "../../services/studentAttempts";
import { averageScore, formatPercent } from "../../utils/scores";

const ALL_TYPES = "all";

const typeTabs = [
  { label: "All results", value: ALL_TYPES },
  { label: "Exams", value: "exam" },
  { label: "Quizzes", value: "quiz" },
];

const scoreBands = [
  { label: "90–100%", min: 90, max: 100 },
  { label: "80–89%", min: 80, max: 89 },
  { label: "70–79%", min: 70, max: 79 },
  { label: "60–69%", min: 60, max: 69 },
  { label: "Below 60%", min: 0, max: 59 },
];

// Mock dates have no year, and every mock result falls in the same one.
const toTime = (date) => Date.parse(`${date} 2026`);

// Released results have a score. Submitted ones stay locked until they close.
const buildResults = () =>
  Object.entries(assessmentTypes).flatMap(([type, { items, nounTitle, basePath }]) =>
    items.flatMap((item) => {
      const shared = { ...item, type, typeLabel: nounTitle };

      if (item.status === "closed") {
        return [{ ...shared, isLocked: false }];
      }

      if (item.status === "open" && loadAttempt(item.id)?.submittedAt) {
        return [{ ...shared, isLocked: true, submissionPath: `${basePath}/${item.id}/submitted` }];
      }

      return [];
    }),
  );

const resultColumns = [
  {
    key: "title",
    header: "Name",
    render: (result) => (
      <div className="flex flex-col gap-[4px]">
        <p className="font-semibold">{result.title}</p>
        {result.isLocked ? (
          <Link to={result.submissionPath} className="text-[11px] whitespace-nowrap text-[#5149b8] hover:underline">
            View submission →
          </Link>
        ) : (
          <p className="text-[11px] text-[#6d7180]">{result.details}</p>
        )}
      </div>
    ),
  },
  { key: "typeLabel", header: "Type" },
  {
    key: "className",
    header: "Class",
    render: (result) => <span className="whitespace-nowrap">{result.className}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (result) => (
      <span className="whitespace-nowrap">{result.isLocked ? result.schedule : result.date}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (result) =>
      result.isLocked ? (
        <StatusBadge label={`Locked until ${result.closesAt}`} variant="closed" />
      ) : (
        <StatusBadge label="Released" variant="open" />
      ),
  },
  {
    key: "score",
    header: "Score",
    render: (result) =>
      result.isLocked ? (
        "—"
      ) : (
        <div className="flex items-center gap-[10px]">
          <span className="w-[32px] font-semibold">{formatPercent(result.score)}</span>
          <div className="h-[5px] w-[72px] overflow-hidden rounded-[3px] bg-[#ededf1]">
            <div
              style={{ width: `${result.score}%` }}
              className="h-full rounded-[3px] bg-[#5149b8]"
            />
          </div>
        </div>
      ),
  },
];

function EmptyChart() {
  return (
    <p className="flex flex-1 items-center justify-center py-[40px] text-center text-[13px] leading-[1.55] text-[#6d7180]">
      No released results match these filters.
    </p>
  );
}

function StudentResults() {
  const { enrolledClasses } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeType, setActiveType] = useState(ALL_TYPES);

  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);
  const requestedClass = searchParams.get("class");
  const activeClass = classNames.includes(requestedClass) ? requestedClass : ALL_CLASSES;

  const results = buildResults().filter(
    (result) =>
      (activeType === ALL_TYPES || result.type === activeType) &&
      (activeClass === ALL_CLASSES || result.className === activeClass),
  );
  const lockedResults = results.filter((result) => result.isLocked);
  const released = results
    .filter((result) => !result.isLocked)
    .sort((a, b) => toTime(b.date) - toTime(a.date));

  const ranked = [...released].sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const lowest = ranked[ranked.length - 1];

  const scoreTrend = [...released].reverse().map((result) => ({
    label: result.date,
    value: result.score,
    detail: result.title,
  }));

  const scoreDistribution = scoreBands.map(({ label, min, max }) => ({
    label,
    value: released.filter((result) => result.score >= min && result.score <= max).length,
  }));

  const handleClassChange = (value) => {
    setSearchParams(value === ALL_CLASSES ? {} : { class: value });
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <p className="text-[30px] leading-[1.2] text-[#202536]">Results</p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">
          Your scores from exams and quizzes, and how they're changing over time.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <Tabs tabs={typeTabs} activeTab={activeType} onChange={setActiveType} />
        </div>
        <ClassFilter classNames={classNames} value={activeClass} onChange={handleClassChange} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Average score"
          value={released.length ? formatPercent(averageScore(released)) : "—"}
          subtext={`Across ${released.length} released results`}
        />
        <StatCard
          title="Best score"
          value={best ? formatPercent(best.score) : "—"}
          subtext={best ? best.title : "No results yet"}
        />
        <StatCard
          title="Lowest score"
          value={lowest ? formatPercent(lowest.score) : "—"}
          subtext={lowest ? lowest.title : "No results yet"}
        />
        <StatCard
          title="Awaiting results"
          value={lockedResults.length}
          subtext={lockedResults.length ? "Unlock when they close" : "Nothing waiting right now"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-3">
        <SectionCard title="Score trend" action="Released results" className="xl:col-span-2">
          {released.length ? (
            <LineChart
              data={scoreTrend}
              label="Score on each released result, oldest to newest"
              height={356}
              formatValue={formatPercent}
            />
          ) : (
            <EmptyChart />
          )}
        </SectionCard>

        <SectionCard title="Score spread" action="Number of results">
          {released.length ? (
            <BarChart
              data={scoreDistribution}
              label="Number of released results in each score range"
              max={Math.max(...scoreDistribution.map((band) => band.value))}
            />
          ) : (
            <EmptyChart />
          )}
        </SectionCard>
      </div>

      {/* All results */}
      <SectionCard title="All results" action={`${results.length} shown`}>
        <DataTable
          columns={resultColumns}
          rows={[...lockedResults, ...released]}
          emptyMessage="No results match these filters."
        />
      </SectionCard>
    </div>
  );
}

export default StudentResults;
