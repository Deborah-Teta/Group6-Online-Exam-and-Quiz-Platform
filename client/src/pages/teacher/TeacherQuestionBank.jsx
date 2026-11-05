import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Plus, Sparkles } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import Notice from "../../components/common/Notice";
import AddQuestion from "../../components/Teacher/Question Bank/Add question";
import EditQuestion from "../../components/Teacher/Question Bank/Edit question";
import QuestionsList from "../../components/Teacher/Question Bank/Questions list";
import {
  createTeacherQuestion,
  deleteTeacherQuestion,
  getTeacherQuestions,
  updateTeacherQuestion,
} from "../../services/teacherService";

function TeacherQuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [pendingDraftCount, setPendingDraftCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [error, setError] = useState("");

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getTeacherQuestions();
      setQuestions(data.questions);
      setPendingDraftCount(data.pendingDraftCount);
    } catch (requestError) {
      setError(requestError.message || "Could not load your questions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    getTeacherQuestions()
      .then((data) => {
        if (!isCurrent) return;
        setQuestions(data.questions);
        setPendingDraftCount(data.pendingDraftCount);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message || "Could not load your questions.");
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadQuestions]);

  const topicsCount = new Set(questions.map((question) => question.topic)).size;

  async function handleAdd(question) {
    setError("");
    try {
      const created = await createTeacherQuestion(question);
      setQuestions((current) => [created, ...current]);
      setIsAddOpen(false);
    } catch (requestError) {
      setError(requestError.message || "Could not add the question.");
    }
  }

  async function handleEdit(updatedQuestion) {
    setError("");
    try {
      const updated = await updateTeacherQuestion(editingQuestion.id, updatedQuestion);
      setQuestions((current) =>
        current.map((question) => question.id === updated.id ? updated : question),
      );
      setEditingQuestion(null);
    } catch (requestError) {
      setError(requestError.message || "Could not update the question.");
    }
  }

  async function handleDelete(question) {
    const confirmed = window.confirm(
      `Delete this question?\n\n"${question.questionText}"`,
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteTeacherQuestion(question.id);
      setQuestions((current) => current.filter((item) => item.id !== question.id));
    } catch (requestError) {
      setError(requestError.message || "Could not delete the question.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your question bank
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading
              ? "Loading your questions…"
              : `Ready-to-use questions, reviewed by you. ${questions.length} questions · ${topicsCount} topics.`}
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
            onClick={() => {
              setError("");
              setIsAddOpen(true);
            }}
          />
        </div>
      </header>

      {pendingDraftCount > 0 && (
        <Notice
          icon={Info}
          title={`${pendingDraftCount} AI ${pendingDraftCount === 1 ? "draft is" : "drafts are"} waiting for your review`}
        >
          Unreviewed drafts stay out of your bank and exams. Review and approve
          generated questions before using them in an assessment.
        </Notice>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          {!isLoading && questions.length === 0 && (
            <button type="button" onClick={loadQuestions} className="font-semibold underline">
              Try again
            </button>
          )}
        </div>
      )}

      <QuestionsList
        questions={questions}
        onEdit={(question) => {
          setError("");
          setEditingQuestion(question);
        }}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <AddQuestion
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
        error={isAddOpen ? error : ""}
      />

      <EditQuestion
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleEdit}
        error={editingQuestion ? error : ""}
      />
    </div>
  );
}

export default TeacherQuestionBank;
