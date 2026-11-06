import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ExamDetailsForm from "../../components/Teacher/Exams/ExamDetailsForm";
import ExamPreview from "../../components/Teacher/Exams/ExamPreview";
import QuestionBankPicker from "../../components/Teacher/Exams/QuestionBankPicker";
import StatusBadge from "../../components/common/StatusBadge";
import {
  createTeacherExam,
  getTeacherClasses,
  getTeacherExams,
  getTeacherQuestions,
} from "../../services/teacherService";

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEndDateTime(startDate, startTime, duration) {
  if (!startDate || !startTime || !duration) {
    return { date: startDate, time: startTime };
  }
  const [year, month, day] = startDate.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  const end = new Date(
    Date.UTC(year, month - 1, day, hour, minute + Number(duration)),
  );
  return {
    date: end.toISOString().slice(0, 10),
    time: `${String(end.getUTCHours()).padStart(2, "0")}:${String(
      end.getUTCMinutes(),
    ).padStart(2, "0")}`,
  };
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toStartTimeISO(exam) {
  const [year, month, day] = exam.startDate.split("-").map(Number);
  const [hour, minute] = exam.startTime.split(":").map(Number);
  const zoneOffsetMinutes = exam.timeZone === "GMT" ? 0 : 120;
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) - zoneOffsetMinutes * 60_000,
  ).toISOString();
}

function TeacherCreateExam() {
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [exam, setExam] = useState({
    title: "",
    classId: searchParams.get("classId") || "",
    startDate: getTomorrow(),
    startTime: "10:00",
    timeZone: "CAT",
    duration: "30",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [teacherClasses, questionData, teacherExams] = await Promise.all([
        getTeacherClasses(),
        getTeacherQuestions(),
        getTeacherExams(),
      ]);
      setClasses(teacherClasses.map(({ id, name, students }) => ({ id, name, students })));
      const mappedQuestions = questionData.questions.map((question) => ({
        ...question,
        typeLabel: question.type === "multiple_choice" ? "Multiple choice" : "True / false",
      }));
      setQuestionBank(mappedQuestions);
      setAssessments(teacherExams);
      setSelectedIds([]);
    } catch (requestError) {
      setError(requestError.message || "Could not load assessment setup data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([getTeacherClasses(), getTeacherQuestions(), getTeacherExams()])
      .then(([teacherClasses, questionData, teacherExams]) => {
        if (!isCurrent) return;
        setClasses(teacherClasses.map(({ id, name, students }) => ({ id, name, students })));
        setQuestionBank(questionData.questions.map((question) => ({
          ...question,
          typeLabel: question.type === "multiple_choice" ? "Multiple choice" : "True / false",
        })));
        setAssessments(teacherExams);
        setSelectedIds([]);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || "Could not load assessment setup data.");
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadPageData]);

  const teacherClass = classes.find((item) => item.id === exam.classId);
  const selectedQuestions = questionBank.filter((question) =>
    selectedIds.includes(question.id),
  );
  const totalPoints = selectedQuestions.reduce(
    (total, question) => total + question.points,
    0,
  );
  const questionTypeCounts = selectedQuestions.reduce(
    (counts, question) => {
      if (question.type === "multiple_choice") counts.multipleChoice += 1;
      if (question.type === "true_false") counts.trueFalse += 1;
      return counts;
    },
    { multipleChoice: 0, trueFalse: 0 },
  );

  const endDateTime = useMemo(
    () => getEndDateTime(exam.startDate, exam.startTime, exam.duration),
    [exam.startDate, exam.startTime, exam.duration],
  );
  const startLabel = `${formatDate(exam.startDate)} · ${exam.startTime} ${exam.timeZone}`;
  const endLabel = `${formatDate(endDateTime.date)} · ${endDateTime.time} ${exam.timeZone}`;

  function handleChange(field, value) {
    setExam((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  function handleToggleQuestion(questionId) {
    setSelectedIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
    setMessage("");
  }

  async function handleAction(action) {
    if (!exam.title.trim() || !exam.classId || !exam.startDate || !exam.startTime) {
      setMessage("Enter an assessment title, class, start date, and start time first.");
      return;
    }
    if (!exam.duration || !Number.isInteger(Number(exam.duration)) || Number(exam.duration) < 1 || Number(exam.duration) > 600) {
      setMessage("Duration must be between 1 and 600 minutes.");
      return;
    }
    if (selectedIds.length === 0) {
      setMessage("Select at least one question before saving.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      const created = await createTeacherExam({
        title: exam.title.trim(),
        classId: exam.classId,
        questionIds: selectedIds,
        startTime: toStartTimeISO(exam),
        durationMinutes: Number(exam.duration),
        status: action === "draft" ? "draft" : "scheduled",
      });
      setAssessments((current) => [created, ...current]);
      setMessage(action === "draft" ? "Draft saved." : "Assessment scheduled successfully.");
    } catch (requestError) {
      setError(requestError.message || "Could not save this assessment.");
    } finally {
      setIsSaving(false);
    }
  }

  const assessmentColumns = [
    { key: "title", header: "Assessment" },
    { key: "className", header: "Class" },
    {
      key: "startTime",
      header: "Starts · CAT",
      render: (item) => new Date(item.startTime).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Kigali",
      }),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const start = new Date(item.startTime).getTime();
        const end = start + (Number(item.durationMinutes) || 0) * 60_000;
        const now = Date.now();
        const isClosed = item.status === "closed" || now >= end;
        const isOpen = now >= start && now < end;
        const label = isClosed ? "Closed" : isOpen ? "In progress" : (item.status === "scheduled" ? "Scheduled" : item.status);
        const variant = isClosed ? "closed" : isOpen ? "open" : "upcoming";
        return <StatusBadge label={label} variant={variant} />;
      },
    },
    { key: "questionCount", header: "Questions" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an exam
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose the questions, set the window. Give your class a clear next step.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button type="button" onClick={loadPageData} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">Loading classes and questions…</p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
            <ExamDetailsForm
              values={exam}
              classes={classes}
              onChange={handleChange}
              endTime={`${endDateTime.time} on ${formatDate(endDateTime.date)}`}
            />

            <QuestionBankPicker
              questions={questionBank}
              selectedIds={selectedIds}
              onToggle={handleToggleQuestion}
            />
          </div>

          <aside className="xl:sticky xl:top-24">
            <ExamPreview
              exam={exam}
              teacherClass={teacherClass}
              questions={selectedQuestions}
              totalPoints={totalPoints}
              questionTypeCounts={questionTypeCounts}
              startLabel={startLabel}
              endLabel={endLabel}
              message={message}
              isSaving={isSaving}
              onAction={handleAction}
            />
          </aside>
        </div>
      )}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Your assessments</h2>
          <p className="mt-1 text-xs text-slate-500">Assessments saved to your classes.</p>
        </div>
        <DataTable
          columns={assessmentColumns}
          rows={assessments}
          emptyMessage={isLoading ? "Loading assessments…" : "You have not created any assessments yet."}
        />
      </section>
    </div>
  );
}

export default TeacherCreateExam;
