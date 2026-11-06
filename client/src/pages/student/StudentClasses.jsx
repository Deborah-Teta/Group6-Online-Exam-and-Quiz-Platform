import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { CalendarClock, ChartNoAxesCombined, ClipboardCheck, Plus, Users } from "lucide-react";
import Button from "../../components/common/ActionButton";
import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import { averageScore, formatPercent } from "../../utils/scores";

const examsInClass = (exams, enrolledClass, status) =>
  exams.filter(
    (exam) => exam.classId === enrolledClass.id && exam.status === status,
  );

const classColumns = [
  {
    key: "name",
    header: "Class",
    render: (enrolledClass) => (
      <div className="flex flex-col gap-[4px]">
        <p className="text-sm font-bold whitespace-nowrap text-slate-900">{enrolledClass.name}</p>
        <p className="text-xs whitespace-nowrap text-slate-500">{enrolledClass.teacher}</p>
      </div>
    ),
  },
  {
    key: "joinedOn",
    header: "Joined",
    render: (enrolledClass) => <span className="whitespace-nowrap">{enrolledClass.joinedOn}</span>,
  },
  {
    key: "open",
    header: "Open now",
    render: (enrolledClass) => enrolledClass.openCount,
  },
  {
    key: "upcoming",
    header: "Coming up",
    render: (enrolledClass) => enrolledClass.upcomingCount,
  },
  {
    key: "completed",
    header: "Completed",
    render: (enrolledClass) => enrolledClass.completedCount,
  },
  {
    key: "average",
    header: "Average",
    render: (enrolledClass) => enrolledClass.classAverage,
  },
  {
    key: "nextExam",
    header: "Next exam · CAT",
    render: (enrolledClass) => {
      const nextExam =
        enrolledClass.nextExam;

      if (!nextExam) {
        return <span className="whitespace-nowrap text-muted">None scheduled</span>;
      }

      return (
        <div className="flex flex-col gap-[4px]">
          <p className="text-sm font-bold whitespace-nowrap text-slate-900">{nextExam.title}</p>
          <p className="text-xs whitespace-nowrap text-slate-500">{nextExam.schedule}</p>
        </div>
      );
    },
  },
  {
    key: "action",
    header: "Action",
    render: (enrolledClass) => (
      <Link
        to={`/student/exams?class=${encodeURIComponent(enrolledClass.name)}`}
        className="text-xs font-bold whitespace-nowrap text-[#5149B8] hover:underline"
      >
        View exams →
      </Link>
    ),
  },
];

function StudentClasses() {
  const navigate = useNavigate();
  const { enrolledClasses, exams, isLoading } = useOutletContext();
  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);

  const openExams = exams.filter((exam) => exam.status === "open");
  const upcomingExams = exams.filter((exam) => exam.status === "upcoming");
  const completedExams = exams.filter(
    (exam) => exam.status === "closed" && exam.score !== undefined,
  );

  return (
    <>
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={28} className="text-[#5149B8]" />}
          title="Enrolled classes"
          value={isLoading ? "…" : enrolledClasses.length}
          subtext={classNames.join(" · ")}
        />
        <StatCard
          icon={<ClipboardCheck size={28} className="text-[#5149B8]" />}
          title="Open now"
          value={openExams.length}
          subtext={
            openExams[0]
              ? `${openExams[0].title} closes at ${openExams[0].closesTime}`
              : "No assessments open right now"
          }
        />
        <StatCard
          icon={<CalendarClock size={28} className="text-[#5149B8]" />}
          title="Coming up"
          value={upcomingExams.length}
          subtext={
            upcomingExams[0]
              ? `${upcomingExams[0].title} · ${upcomingExams[0].schedule}`
              : "Nothing scheduled"
          }
        />
        <StatCard
          icon={<ChartNoAxesCombined size={28} className="text-[#5149B8]" />}
          title="Average score"
          value={completedExams.length ? formatPercent(averageScore(completedExams)) : "—"}
          subtext={`Across ${completedExams.length} released results`}
        />
      </div>

      {/* Classes */}
      <SectionCard
        title="Your classes"
       
        action={
          <Button
            label="Join a class"
            icon={<Plus size={14} />}
            onClick={() => navigate("/student/classes/join")}
          />
        }
      >
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted">Loading your classes…</p>
        ) : (
          <DataTable
            columns={classColumns}
            rows={enrolledClasses.map((enrolledClass) => ({
              ...enrolledClass,
              openCount: examsInClass(exams, enrolledClass, "open").length,
              upcomingCount: examsInClass(exams, enrolledClass, "upcoming").length,
              completedCount: exams.filter(
                (exam) =>
                  exam.classId === enrolledClass.id &&
                  exam.attempt &&
                  exam.attempt.status !== "in_progress",
              ).length,
              classAverage: (() => {
                const released = examsInClass(exams, enrolledClass, "closed").filter(
                  (exam) => exam.score !== undefined,
                );
                return released.length ? formatPercent(averageScore(released)) : "—";
              })(),
              nextExam:
                examsInClass(exams, enrolledClass, "open")[0] ??
                examsInClass(exams, enrolledClass, "upcoming")[0],
            }))}
            emptyMessage="You haven't joined a class yet."
          />
        )}
      </SectionCard>
    </>
  );
}

export default StudentClasses;
