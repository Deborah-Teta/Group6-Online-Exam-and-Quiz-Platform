import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import Button from "../../components/common/Button";
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
        <p className="font-semibold whitespace-nowrap">{enrolledClass.name}</p>
        <p className="text-[11px] whitespace-nowrap text-[#6d7180]">{enrolledClass.teacher}</p>
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
        return <span className="whitespace-nowrap text-[#6d7180]">None scheduled</span>;
      }

      return (
        <div className="flex flex-col gap-[4px]">
          <p className="font-semibold whitespace-nowrap">{nextExam.title}</p>
          <p className="text-[11px] whitespace-nowrap text-[#6d7180]">{nextExam.schedule}</p>
        </div>
      );
    },
  },
  {
    key: "action",
    header: "Action",
    render: () => (
      <Link to="/student/exams" className="text-[12px] whitespace-nowrap text-[#5149b8] hover:underline">
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
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between sm:gap-[24px]">
        <div className="flex flex-col gap-[6px]">
          <p className="text-[30px] leading-[1.2] text-[#202536]">My classes</p>
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
            The classes you've joined and how each one is going.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            label="Join a class"
            icon={<Plus size={16} />}
            onClick={() => navigate("/student/classes/join")}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Enrolled classes"
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

      {/* Classes */}
      <SectionCard title="Your classes">
        <DataTable
          columns={classColumns}
          rows={enrolledClasses}
          emptyMessage="You haven't joined a class yet."
        />
      </SectionCard>
    </div>
  );
}

export default StudentClasses;
