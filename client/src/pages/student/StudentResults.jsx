import { useMemo } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { ChartNoAxesCombined, LockKeyhole, TrendingDown, Trophy } from "lucide-react";
import BarChart from "../../components/common/BarChart";
import Card from "../../components/common/Card";
import ClassFilter, { ALL_CLASSES } from "../../components/common/ClassFilter";
import DataTable from "../../components/common/DataTable";
import LineChart from "../../components/common/LineChart";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import { averageScore, formatPercent } from "../../utils/scores";

const scoreBands = [
  { label: "90–100%", min: 90, max: 100 },
  { label: "80–89%", min: 80, max: 89 },
  { label: "70–79%", min: 70, max: 79 },
  { label: "60–69%", min: 60, max: 69 },
  { label: "Below 60%", min: 0, max: 59 },
];

function buildResults(exams) {
  return exams.flatMap((exam) => {
    if (!exam.attempt || exam.attempt.status === "in_progress") return [];

    if (exam.attempt.resultReleased) {
      return [
        {
          ...exam,
          isLocked: false,
          score: exam.attempt.score,
          date: exam.date,
        },
      ];
    }

    return [{ ...exam, isLocked: true }];
  });
}

const resultColumns = [
  {
    key: "title",
    header: "Exam",
    render: (result) => (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-slate-900">{result.title}</p>
        {result.isLocked ? (
          <Link
            to={`/student/exams/${result.id}/submitted`}
            className="text-[11px] whitespace-nowrap text-primary hover:underline"
          >
            View submission →
          </Link>
        ) : (
          <p className="text-xs text-slate-500">{result.details}</p>
        )}
      </div>
    ),
  },
  {
    key: "className",
    header: "Class",
    render: (result) => <span className="whitespace-nowrap">{result.className}</span>,
  },
  {
    key: "date",
    header: "Date",
    render: (result) => (
      <span className="whitespace-nowrap">
        {result.isLocked ? result.schedule : result.date}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (result) =>
      result.isLocked ? (
        <StatusBadge label={`Locked until ${result.closesTime} CAT`} variant="closed" />
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
          <span className="w-[42px] font-bold text-slate-900">
            {formatPercent(result.score)}
          </span>
          <div className="h-[5px] w-[72px] overflow-hidden rounded-full bg-line">
            <div
              style={{ width: `${result.score}%` }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      ),
  },
];

function EmptyChart() {
  return (
    <p className="flex flex-1 items-center justify-center py-10 text-center text-[13px] leading-[1.55] text-muted">
      No released results match these filters.
    </p>
  );
}

function StudentResults() {
  const { enrolledClasses, exams, isLoading } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const classNames = enrolledClasses.map((item) => item.name);
  const requestedClass = searchParams.get("class");
  const activeClass = classNames.includes(requestedClass) ? requestedClass : ALL_CLASSES;

  const results = useMemo(
    () =>
      buildResults(exams).filter(
        (result) => activeClass === ALL_CLASSES || result.className === activeClass,
      ),
    [exams, activeClass],
  );
  const lockedResults = results.filter((result) => result.isLocked);
  const released = results
    .filter((result) => !result.isLocked)
    .sort((a, b) => b.startTime - a.startTime);
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
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Your Exam Results</h2>
          <p className="text-xs text-slate-500">View released performance metrics and score progress.</p>
        </div>
        <ClassFilter
          classNames={classNames}
          value={activeClass}
          onChange={handleClassChange}
        />
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ChartNoAxesCombined size={28} className="text-[#5149B8]" />}
          title="Average score"
          value={released.length ? formatPercent(averageScore(released)) : "—"}
          subtext={`Across ${released.length} released results`}
        />
        <StatCard
          icon={<Trophy size={28} className="text-[#5149B8]" />}
          title="Best score"
          value={best ? formatPercent(best.score) : "—"}
          subtext={best ? best.title : "No results yet"}
        />
        <StatCard
          icon={<TrendingDown size={28} className="text-[#5149B8]" />}
          title="Lowest score"
          value={lowest ? formatPercent(lowest.score) : "—"}
          subtext={lowest ? lowest.title : "No results yet"}
        />
        <StatCard
          icon={<LockKeyhole size={28} className="text-[#5149B8]" />}
          title="Awaiting results"
          value={lockedResults.length}
          subtext={lockedResults.length ? "Unlock when they close" : "Nothing waiting right now"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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

      <SectionCard title="All results" action={`${results.length} shown`}>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted">Loading your results…</p>
        ) : (
          <DataTable
            columns={resultColumns}
            rows={[...lockedResults, ...released]}
            emptyMessage="No results match these filters."
          />
        )}
      </SectionCard>
    </>
  );
}

export default StudentResults;
