import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/common/ActionButton";
import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";

const dashboardStats = [
  {
    title: "Your classes",
    value: "4",
    subtext: "96 enrolled students",
    icon: <GraduationCap size={26} />,
  },
  {
    title: "Question bank",
    value: "24",
    subtext: "8 AI-drafted questions",
    icon: <BookOpen size={26} />,
  },
  {
    title: "Exams this week",
    value: "8",
    subtext: "2 scheduled for today",
    icon: <ClipboardList size={26} />,
  },
  {
    title: "Drafts to review",
    value: "3",
    subtext: "Review before using",
    icon: <Sparkles size={26} />,
  },
];

const upcomingExams = [
  {
    id: "cell-biology",
    title: "Cell Biology Checkpoint",
    className: "Biology 10A · 5 questions · 10 points",
    schedule: "10:00–10:30",
    status: "upcoming",
    statusLabel: "In 15 minutes",
  },
  {
    id: "plant-cells",
    title: "Plant Cells Practice",
    className: "Biology 10B",
    schedule: "14:00–14:20",
    status: "upcoming",
    statusLabel: "Scheduled",
  },
  {
    id: "cell-transport",
    title: "Cell Transport Quiz",
    className: "Biology 10A",
    schedule: "30 Oct · 11:00",
    status: "upcoming",
    statusLabel: "Scheduled",
  },
];

const examColumns = [
  {
    key: "exam",
    header: "Exam / class",
    render: (exam) => (
      <div className="flex flex-col gap-1">
        <span className="font-bold text-slate-900">{exam.title}</span>
        <span className="text-[11px] text-slate-500">{exam.className}</span>
      </div>
    ),
  },
  {
    key: "schedule",
    header: "Schedule · GMT",
  },
  {
    key: "status",
    header: "Status",
    render: (exam) => (
      <StatusBadge label={exam.statusLabel} variant={exam.status} />
    ),
  },
];

const teacherClasses = [
  { id: "biology-10a", name: "Biology 10A", students: 8, code: "BIO10A" },
  { id: "biology-10b", name: "Biology 10B", students: 32, code: "BIO10B" },
  { id: "science-9a", name: "Science 9A", students: 28, code: "SCI09A" },
  {
    id: "science-enrichment",
    name: "Science enrichment",
    students: 28,
    code: "ENRICH",
  },
];

function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, Sarah.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A clear view of your classes and the day ahead.
          </p>
        </div>
      </section>

      <section
        aria-label="Teacher overview"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <SectionCard
          title="Upcoming exams"
          action={<span>Today · 29 October</span>}
          className="xl:col-span-2"
        >
          <DataTable
            columns={examColumns}
            rows={upcomingExams}
            emptyMessage="No upcoming exams."
          />

          <button
            type="button"
            onClick={() => navigate("/teacher/exams")}
            className="w-fit text-xs font-bold text-[#0B609D] transition hover:text-[#084877]"
          >
            View all exams →
          </button>
        </SectionCard>

        <SectionCard
          title="A little help, on your terms"
          description="Use AI to get a first draft from your lesson notes."
        >
          <div className="flex flex-col gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF3FD] text-[#0B609D]">
              <Sparkles size={20} />
            </div>

            <p className="text-sm leading-6 text-slate-700">
              Turn your lesson notes into a starting point for your next quiz.
            </p>

            <p className="text-xs leading-5 text-slate-500">
              AI drafts always need your review. Only approved questions can be
              used in your question bank.
            </p>

            <ActionButton
              label="Generate questions"
              variant="secondary"
              onClick={() => navigate("/teacher/ai-generator")}
            />

            <p className="text-[11px] text-slate-400">
              3 of 10 generations used today
            </p>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Your classes"
        action={
          <button
            type="button"
            onClick={() => navigate("/teacher/classes")}
            className="text-xs font-medium text-[#0B609D] transition hover:text-[#084877]"
          >
            View all classes →
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {teacherClasses.map((teacherClass) => (
            <button
              key={teacherClass.id}
              type="button"
              onClick={() => navigate("/teacher/classes")}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-[#C9D7ED] hover:bg-[#EEF3FD]"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users size={15} className="text-[#0B609D]" />
                {teacherClass.name}
              </span>

              <span className="mt-2 block text-xs text-slate-500">
                {teacherClass.students} students
              </span>

              <span className="mt-3 block text-[11px] font-medium text-[#0B609D]">
                Joining code · {teacherClass.code}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default TeacherDashboard;