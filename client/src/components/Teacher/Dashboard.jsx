import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ActionButton from "../../components/common/ActionButton";
import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/statuscard";
import StatusBadge from "../../components/common/StatusBadge";
import { getTeacherDashboard } from "../../services/teacherService";

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
    header: "Schedule · CAT",
  },
  {
    key: "status",
    header: "Status",
    render: (exam) => (
      <StatusBadge label={exam.statusLabel} variant={exam.status} />
    ),
  },
];

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const handleDashboardError = useCallback((requestError) => {
    setError(requestError.message || "Could not load your dashboard.");
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setDashboard(await getTeacherDashboard());
    } catch (requestError) {
      handleDashboardError(requestError);
    } finally {
      setIsLoading(false);
    }
  }, [handleDashboardError]);

  useEffect(() => {
    let isCurrent = true;
    getTeacherDashboard()
      .then((data) => {
        if (isCurrent) setDashboard(data);
      })
      .catch((requestError) => {
        if (isCurrent) handleDashboardError(requestError);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [handleDashboardError]);

  const stats = dashboard?.stats;
  const dashboardStats = stats
    ? [
        {
          title: "Your classes",
          value: stats.classCount,
          subtext: `${stats.studentCount} enrolled students`,
          icon: <GraduationCap size={26} />,
        },
        {
          title: "Question bank",
          value: stats.questionCount,
          subtext: `${stats.aiQuestionCount} AI-generated questions`,
          icon: <BookOpen size={26} />,
        },
        {
          title: "Exams next 7 days",
          value: stats.examsNextSevenDays,
          subtext: `${stats.examsToday} scheduled today`,
          icon: <ClipboardList size={26} />,
        },
        {
          title: "Drafts to review",
          value: stats.pendingDraftCount,
          subtext: "Pending AI drafts",
          icon: <Sparkles size={26} />,
        },
      ]
    : [];
  const teacherName = user?.name || user?.fullName || "Teacher";
  const firstName = teacherName.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A clear view of your classes and the day ahead.
          </p>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button type="button" onClick={loadDashboard} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading your dashboard…
        </p>
      ) : dashboard && (
        <section
          aria-label="Teacher overview"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {dashboardStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        <SectionCard
          title="Upcoming exams"
          action={<span>Upcoming scheduled assessments</span>}
          className="xl:col-span-2"
        >
          <DataTable
            columns={examColumns}
            rows={(dashboard?.upcomingExams || []).map((exam) => {
              const start = new Date(exam.startTime);
              const end = new Date(start.getTime() + exam.durationMinutes * 60_000);
              const formatTime = (date) => date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Africa/Kigali",
              });
              const formatDate = (date) => date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "Africa/Kigali",
              });

              const now = Date.now();
              const isPast = now >= end.getTime();
              const isStarted = now >= start.getTime() && !isPast;

              return {
                id: String(exam.id),
                title: exam.title,
                className: `${exam.className} · ${exam.questionCount} questions · ${exam.totalPoints} points`,
                schedule: `${formatDate(start)} · ${formatTime(start)}–${formatTime(end)} CAT`,
                status: isPast ? "closed" : isStarted ? "open" : "upcoming",
                statusLabel: isPast ? "Closed" : isStarted ? "In progress" : "Scheduled",
              };
            })}
            emptyMessage={isLoading ? "Loading upcoming assessments…" : "No upcoming assessments."}
          />

          <button
            type="button"
            onClick={() => navigate("/teacher/exams")}
            className="w-fit text-xs font-bold text-[#5149B8] transition hover:text-[#413B9A]"
          >
            View all exams →
          </button>
        </SectionCard>

        <SectionCard
          title="A little help, on your terms"
          description="Use AI to get a first draft from your lesson notes."
        >
          <div className="flex flex-col gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF] text-[#5149B8]">
              <Sparkles size={20} />
            </div>

            <p className="text-sm leading-6 text-slate-700">
              Turn your lesson notes into a starting point for your next exam.
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
              {stats?.pendingDraftCount ?? "—"} drafts currently waiting for review.
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
            className="text-xs font-medium text-[#5149B8] transition hover:text-[#413B9A]"
          >
            View all classes →
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(dashboard?.classes || []).slice(0, 4).map((teacherClass) => (
            <button
              key={teacherClass.id}
              type="button"
              onClick={() => navigate("/teacher/classes")}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-[#C9D7ED] hover:bg-[#FFFFFF]"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users size={15} className="text-[#5149B8]" />
                {teacherClass.name}
              </span>

              <span className="mt-2 block text-xs text-slate-500">
                {teacherClass.students} {teacherClass.students === 1 ? "student" : "students"}
              </span>

              <span className="mt-3 block text-[11px] font-medium text-[#5149B8]">
                Joining code · {teacherClass.code}
              </span>
            </button>
          ))}
          {!isLoading && dashboard?.classes?.length === 0 && (
            <p className="col-span-full rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              You do not have any active classes yet.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export default TeacherDashboard;