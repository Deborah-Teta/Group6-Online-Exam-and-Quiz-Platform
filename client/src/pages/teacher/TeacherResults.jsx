import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ExamResults from "../../components/Teacher/Results/Exam results";
import { getTeacherExamResults, getTeacherExams } from "../../services/teacherService";

function formatSubmittedAt(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function mapExamResults(data) {
  const submittedStudents = data.studentResults.filter(
    (student) => student.status !== "in_progress",
  );
  const scores = submittedStudents.map((student) => student.score ?? 0);
  const totalPoints = data.exam.totalPoints;

  return {
    title: data.exam.title,
    className: data.exam.className,
    date: new Date(data.exam.startTime).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    schedule: `${new Date(data.exam.startTime).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    })}–${new Date(
      new Date(data.exam.startTime).getTime() + data.exam.durationMinutes * 60_000,
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    })} GMT`,
    questionCount: data.exam.questionCount,
    totalPoints,
    average: data.summary.classAverage,
    averageScore: Number(((data.summary.classAverage / 100) * totalPoints).toFixed(2)),
    highestScore: Math.max(0, ...scores),
    fullMarkCount: scores.filter((score) => score === totalPoints).length,
    submittedCount: data.summary.submittedAttempts,
    inProgressCount: data.summary.inProgressAttempts,
    classStudentCount: data.summary.classStudentCount,
    students: data.studentResults.map((student) => ({
      id: String(student.studentId),
      name: student.fullName,
      email: student.email,
      score: student.score,
      percent: student.percentage,
      submittedAt: formatSubmittedAt(student.submittedAt),
      status: student.status,
      submission: student.status === "auto_submitted"
        ? "Auto-submitted on expiry"
        : student.status === "in_progress"
          ? "Attempt in progress"
          : "Submitted by student",
    })),
    questions: data.questionResults.map((question) => ({
      id: String(question.questionId),
      topic: question.topic,
      questionText: question.questionText,
      correctCount: question.correctCount,
      totalStudents: question.totalStudents,
      correctPercentage: question.correctPercentage,
    })),
    reviewQuestions: data.questionResults
      .filter((question) => question.totalStudents > 0 && question.correctPercentage < 70)
      .sort((left, right) => left.correctPercentage - right.correctPercentage)
      .map((question) => ({
        topic: question.topic,
        correctPercentage: question.correctPercentage,
      })),
  };
}

function escapeCsv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function TeacherResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assessments, setAssessments] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(
    searchParams.get("examId") || "",
  );
  const [exam, setExam] = useState(null);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    getTeacherExams()
      .then((items) => {
        const available = items.filter((item) => item.status !== "draft");
        if (!isCurrent) return;
        setAssessments(available);
        setSelectedExamId((current) => {
          if (current && available.some((item) => item.id === current)) return current;
          return available[0]?.id || "";
        });
        setIsLoadingAssessments(false);
        if (available.length === 0) setIsLoadingResults(false);
      })
      .catch((requestError) => {
        if (!isCurrent) return;
        setError(requestError.message || "Could not load your assessments.");
        setIsLoadingAssessments(false);
        setIsLoadingResults(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedExamId) {
      return undefined;
    }

    let isCurrent = true;
    getTeacherExamResults(selectedExamId)
      .then((result) => {
        if (isCurrent) {
          setExam(mapExamResults(result));
          setError("");
          setIsLoadingResults(false);
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setExam(null);
          setError(requestError.message || "Could not load assessment results.");
          setIsLoadingResults(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedExamId]);

  function handleSelectExam(event) {
    const examId = event.target.value;
    setSelectedExamId(examId);
    setExam(null);
    setError("");
    setIsLoadingResults(Boolean(examId));
    setSearchParams(examId ? { examId } : {});
  }

  function exportResults() {
    if (!exam) return;
    const rows = [
      ["Student", "Score", "Percent", "Submitted (GMT)", "Status"],
      ...exam.students.map((student) => [
        student.name,
        student.score === null ? "" : `${student.score}/${exam.totalPoints}`,
        student.percent === null ? "" : `${student.percent}%`,
        student.submittedAt,
        student.submission,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exam.title.toLowerCase().replaceAll(" ", "-")}-results.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Results
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review submitted attempts and class performance.
          </p>
        </div>
        <label className="flex min-w-64 flex-col gap-1.5 text-xs font-medium text-slate-700">
          Select an assessment
          <select
            value={selectedExamId}
            onChange={handleSelectExam}
            disabled={isLoadingAssessments || assessments.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          >
            <option value="">
              {isLoadingAssessments ? "Loading assessments…" : "No assessments available"}
            </option>
            {assessments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {item.className}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {isLoadingResults && (
        <p role="status" className="text-sm text-slate-500">Loading assessment results…</p>
      )}
      {exam && !isLoadingResults && (
        <ExamResults exam={exam} onExport={exportResults} />
      )}
      {!isLoadingAssessments && assessments.length === 0 && !error && (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          You do not have any published or scheduled assessments yet.
        </p>
      )}
    </div>
  );
}

export default TeacherResults;
