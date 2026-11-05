import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Plus, Sparkles } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import Notice from "../../components/common/Notice";
import AddQuestion from "../../components/Teacher/Question Bank/Add question";
import EditQuestion from "../../components/Teacher/Question Bank/Edit question";
import QuestionsList from "../../components/Teacher/Question Bank/Questions list";

const initialQuestions = [
  {
    id: "q1",
    questionText: "Which organelle releases energy during aerobic respiration?",
    type: "multiple_choice",
    topic: "Cell organelles",
    points: 2,
    difficulty: "medium",
    source: "manual",
    options: [
      { text: "Nucleus", isCorrect: false },
      { text: "Mitochondrion", isCorrect: true },
    ],
  },
  {
    id: "q2",
    questionText: "Plant and animal cells both have a cell membrane.",
    type: "true_false",
    topic: "Cell structures",
    points: 2,
    difficulty: "easy",
    source: "ai",
    options: [
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ],
  },
  {
    id: "q3",
    questionText: "What controls the movement of substances into and out of a cell?",
    type: "multiple_choice",
    topic: "Cell transport",
    points: 2,
    difficulty: "medium",
    source: "manual",
    options: [
      { text: "Cell membrane", isCorrect: true },
      { text: "Nucleus", isCorrect: false },
    ],
  },
  {
    id: "q4",
    questionText: "Which structure contains the genetic material of a cell?",
    type: "multiple_choice",
    topic: "Cell organelles",
    points: 2,
    difficulty: "easy",
    source: "ai",
    options: [
      { text: "Nucleus", isCorrect: true },
      { text: "Ribosome", isCorrect: false },
    ],
  },
  {
    id: "q5",
    questionText: "Chloroplasts are found in animal cells.",
    type: "true_false",
    topic: "Plant cells",
    points: 2,
    difficulty: "easy",
    source: "manual",
    options: [
      { text: "True", isCorrect: false },
      { text: "False", isCorrect: true },
    ],
  },
  {
    id: "q6",
    questionText: "Which cell structure is the site of protein synthesis?",
    type: "multiple_choice",
    topic: "Cell organelles",
    points: 2,
    difficulty: "medium",
    source: "manual",
    options: [
      { text: "Ribosome", isCorrect: true },
      { text: "Vacuole", isCorrect: false },
    ],
  },
  {
    id: "q7",
    questionText: "The cell wall is made of cellulose in plant cells.",
    type: "true_false",
    topic: "Plant cells",
    points: 2,
    difficulty: "easy",
    source: "ai",
    options: [
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ],
  },
  {
    id: "q8",
    questionText: "What is the role of cytoplasm?",
    type: "multiple_choice",
    topic: "Cell structures",
    points: 2,
    difficulty: "medium",
    source: "manual",
    options: [
      { text: "Site of many chemical reactions", isCorrect: true },
      { text: "Stores genetic information", isCorrect: false },
    ],
  },
];

function TeacherQuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(initialQuestions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const topicsCount = new Set(questions.map((question) => question.topic)).size;
  const pendingDraftCount = 3;

  function handleAdd(question) {
    setQuestions((current) => [
      { ...question, id: `question-${Date.now()}` },
      ...current,
    ]);
    setIsAddOpen(false);
  }

  function handleEdit(updatedQuestion) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === editingQuestion.id
          ? { ...updatedQuestion, id: editingQuestion.id }
          : question,
      ),
    );
    setEditingQuestion(null);
  }

  function handleDelete(question) {
    const confirmed = window.confirm(
      `Delete this question?\n\n"${question.questionText}"`,
    );

    if (!confirmed) return;

    setQuestions((current) =>
      current.filter((item) => item.id !== question.id),
    );
    setDeleteError("");
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your question bank
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ready-to-use questions, reviewed by you. {questions.length} questions
            · {topicsCount} topics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Generate with AI"
            variant="secondary"
            icon={<Sparkles size={14} />}
            onClick={() => navigate("/teacher/ai-generator")}
          />
          <ActionButton
            label="Add question"
            icon={<Plus size={14} />}
            onClick={() => setIsAddOpen(true)}
          />
        </div>
      </header>

      <Notice icon={Info} title={`${pendingDraftCount} AI drafts are waiting for your review`}>
        Unreviewed drafts stay out of your bank and exams. Open AI drafts to edit,
        confirm answers, and approve them individually.
      </Notice>

      {deleteError && (
        <p role="alert" className="text-sm text-red-600">{deleteError}</p>
      )}

      <QuestionsList
        questions={questions}
        onEdit={setEditingQuestion}
        onDelete={handleDelete}
      />

      <AddQuestion
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
      />

      <EditQuestion
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleEdit}
      />
    </div>
  );
}

export default TeacherQuestionBank;