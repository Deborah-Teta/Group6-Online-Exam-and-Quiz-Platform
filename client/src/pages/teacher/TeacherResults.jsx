import ExamResults from "../../components/Teacher/Results/Exam results";

const exam = {
  title: "Cell Biology Checkpoint",
  className: "Biology 10A",
  date: "29 Oct 2026",
  schedule: "10:00–10:30 GMT",
  questionCount: 5,
  totalPoints: 10,
  pointsPerQuestion: 2,
  average: 72.5,
  averageScore: 7.25,
  highestScore: 10,
  fullMarkCount: 2,
  resultStatus: "Released",
  releaseTime: "10:30 GMT",
  lessonSuggestion: "plant cells",
  lessonNote:
    "Five of eight students missed the chloroplast question. Revisit the differences between plant and animal cells before the next assessment.",
  students: [
    { id: "s1", name: "Amelia Brooks", score: 10, percent: 100, submittedAt: "10:18", submission: "Submitted by student" },
    { id: "s2", name: "Ethan Chen", score: 10, percent: 100, submittedAt: "10:21", submission: "Submitted by student" },
    { id: "s3", name: "Maya Patel", score: 6, percent: 60, submittedAt: "10:12", submission: "Submitted by student" },
    { id: "s4", name: "Noah Williams", score: 8, percent: 80, submittedAt: "10:24", submission: "Submitted by student" },
    { id: "s5", name: "Sofia Garcia", score: 8, percent: 80, submittedAt: "10:26", submission: "Submitted by student" },
    { id: "s6", name: "Oliver James", score: 6, percent: 60, submittedAt: "10:30", submission: "Auto-submitted on expiry" },
    { id: "s7", name: "Isla Thompson", score: 6, percent: 60, submittedAt: "10:28", submission: "Submitted by student" },
    { id: "s8", name: "Leo Wilson", score: 4, percent: 40, submittedAt: "10:30", submission: "Auto-submitted on expiry" },
  ],
  questions: [
    {
      id: "q1",
      topic: "Cell organelles",
      questionText: "Which organelle releases energy during aerobic respiration?",
      correctCount: 8,
    },
    {
      id: "q2",
      topic: "Cell structures",
      questionText: "Plant and animal cells both have a cell membrane.",
      correctCount: 7,
    },
    {
      id: "q3",
      topic: "Cell transport",
      questionText: "What controls the movement of substances into and out of a cell?",
      correctCount: 6,
    },
    {
      id: "q4",
      topic: "Cell organelles",
      questionText: "Which structure contains the genetic material of a cell?",
      correctCount: 5,
    },
    {
      id: "q5",
      topic: "Plant cells",
      questionText: "Chloroplasts are found in animal cells.",
      correctCount: 3,
    },
  ],
};

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function exportResults() {
  const rows = [
    ["Student", "Score", "Percent", "Submitted (GMT)", "Submission"],
    ...exam.students.map((student) => [
      student.name,
      `${student.score}/${exam.totalPoints}`,
      `${student.percent}%`,
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
  URL.revokeObjectURL(url);
}

function TeacherResults() {
  return <ExamResults exam={exam} onExport={exportResults} />;
}

export default TeacherResults;