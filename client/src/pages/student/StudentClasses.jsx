import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { CalendarClock, ChartNoAxesCombined, ClipboardCheck, Plus, Users } from "lucide-react";
import Button from "../../components/common/ActionButton";
import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import { mockExams, mockNextExamNote } from "../../services/studentMockData";
import { averageScore, formatPercent } from "../../utils/scores";

const examsInClass = (enrolledClass, status) =>
  mockExams.filter((exam) => exam.className === enrolledClass.name && exam.status === status);

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
    render: (enrolledClass) => examsInClass(enrolledClass, "open").length,
  },
  {
    key: "upcoming",
    header: "Coming up",
    render: (enrolledClass) => examsInClass(enrolledClass, "upcoming").length,
  },
  {
    key: "completed",
    header: "Completed",
    render: (enrolledClass) => examsInClass(enrolledClass, "closed").length,
  },
  {
    key: "average",
    header: "Average",
    render: (enrolledClass) => {
      const completedExams = examsInClass(enrolledClass, "closed");
      return completedExams.length ? formatPercent(averageScore(completedExams)) : "—";
    },
  },
  {
    key: "nextExam",
    header: "Next exam · GMT",
    render: (enrolledClass) => {
      const nextExam =
        examsInClass(enrolledClass, "open")[0] ?? examsInClass(enrolledClass, "upcoming")[0];

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
        className="text-xs font-bold whitespace-nowrap text-[#0B609D] hover:underline"
      >
        View exams →
      </Link>
    ),
  },
];

function StudentClasses() {
  const navigate = useNavigate();
  const { enrolledClasses } = useOutletContext();
  const classNames = enrolledClasses.map((enrolledClass) => enrolledClass.name);

  const openExams = mockExams.filter((exam) => exam.status === "open");
  const upcomingExams = mockExams.filter((exam) => exam.status === "upcoming");
  const completedExams = mockExams.filter((exam) => exam.status === "closed");

  return (
    <>
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={28} className="text-[#0B609D]" />}
          title="Enrolled classes"
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
        <DataTable
          columns={classColumns}
          rows={enrolledClasses}
          emptyMessage="You haven't joined a class yet."
        />
      </SectionCard>
    </>
  );
}

export default StudentClasses;
