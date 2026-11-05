import { useMemo, useState } from "react";
import ExamDetailsForm from "../../components/Teacher/Exams/ExamDetailsForm";
import ExamPreview from "../../components/Teacher/Exams/ExamPreview";
import QuestionBankPicker from "../../components/Teacher/Exams/QuestionBankPicker";

const classes = [
  { id: "biology-10a", name: "Biology 10A", students: 8 },
  { id: "biology-10b", name: "Biology 10B", students: 32 },
  { id: "science-9a", name: "Science 9A", students: 28 },
  { id: "science-enrichment", name: "Science enrichment", students: 28 },
];

const questionBank = [
  {
    id: "q1",
    questionText: "Which organelle releases energy during aerobic respiration?",
    type: "multiple_choice",
    typeLabel: "Multiple choice",
    topic: "Cell organelles",
    points: 2,
    source: "manual",
  },
  {
    id: "q2",
    questionText: "Plant and animal cells both have a cell membrane.",
    type: "true_false",
    typeLabel: "True / false",
    topic: "Cell structures",
    points: 2,
    source: "ai",
  },
  {
    id: "q3",
    questionText: "What controls the movement of substances into and out of a cell?",
    type: "multiple_choice",
    typeLabel: "Multiple choice",
    topic: "Cell transport",
    points: 2,
    source: "manual",
  },
  {
    id: "q4",
    questionText: "Which structure contains the genetic material of a cell?",
    type: "multiple_choice",
    typeLabel: "Multiple choice",
    topic: "Cell organelles",
    points: 2,
    source: "ai",
  },
  {
    id: "q5",
    questionText: "Chloroplasts are found in animal cells.",
    type: "true_false",
    typeLabel: "True / false",
    topic: "Plant cells",
    points: 2,
    source: "manual",
  },
];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
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

function TeacherCreateExam() {
  const [exam, setExam] = useState({
    title: "Cell Biology Checkpoint",
    classId: "biology-10a",
    startDate: getToday(),
    startTime: "10:00",
    timeZone: "GMT",
    duration: "30",
  });
  const [selectedIds, setSelectedIds] = useState(
    questionBank.map((question) => question.id),
  );
  const [message, setMessage] = useState("");

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

  function handleAction(action) {
    if (!exam.title.trim() || !exam.classId || !exam.startDate || !exam.startTime) {
      setMessage("Enter an exam title, class, start date, and start time first.");
      return;
    }

    if (!exam.duration || Number(exam.duration) < 1) {
      setMessage("Duration must be at least one minute.");
      return;
    }

    if (action === "publish" && selectedIds.length === 0) {
      setMessage("Select at least one question before publishing.");
      return;
    }

    setMessage(
      `The ${action === "draft" ? "draft" : "publish"} API is not connected yet. Nothing has been saved.`,
    );
  }

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
            onAction={handleAction}
          />
        </aside>
      </div>
    </div>
  );
}

export default TeacherCreateExam;