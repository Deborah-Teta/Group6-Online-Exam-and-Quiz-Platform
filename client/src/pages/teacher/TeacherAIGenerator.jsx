import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Check,
  X,
  Trash2,
  Edit2,
  BookOpen,
  Loader2,
} from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import Tabs from "../../components/common/Tabs";
import {
  approveAIDraft,
  deleteAIDraft,
  generateAIDrafts,
  getAllAIDrafts,
  getAIGenerations,
  rejectAIDraft,
  updateAIDraft
} from "../../services/aiService";

export default function TeacherAIGenerator() {
  const navigate = useNavigate();

  // Generator form states
  const [topic, setTopic] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [requestedCount, setRequestedCount] = useState(5);
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generateSuccess, setGenerateSuccess] = useState("");

  // Review states
  const [activeTab, setActiveTab] = useState("pending");
  const [drafts, setDrafts] = useState([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [draftsError, setDraftsError] = useState("");
  const [editingDraft, setEditingDraft] = useState(null);
  const [isUpdatingDraft, setIsUpdatingDraft] = useState(false);
  const [editError, setEditError] = useState("");
  const [approvingDraftId, setApprovingDraftId] = useState(null);

  // History states
  const [generations, setGenerations] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadDrafts = useCallback(async (status = activeTab) => {
    try {
      const data = await getAllAIDrafts({ reviewStatus: status });
      setDrafts(data.drafts || []);
    } catch (err) {
      setDraftsError(err.message || "Failed to load drafts.");
    } finally {
      setIsLoadingDrafts(false);
    }
  }, [activeTab]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getAIGenerations();
      setGenerations(data.generations || []);
    } catch (err) {
      setHistoryError(err.message || "Failed to load generation history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (activeTab === "history") {
      getAIGenerations()
        .then((data) => {
          if (active) setGenerations(data.generations || []);
        })
        .catch((err) => {
          if (active) {
            setHistoryError(err.message || "Failed to load generation history.");
          }
        })
        .finally(() => {
          if (active) setIsLoadingHistory(false);
        });
    } else {
      getAllAIDrafts({ reviewStatus: activeTab })
        .then((data) => {
          if (active) setDrafts(data.drafts || []);
        })
        .catch((err) => {
          if (active) setDraftsError(err.message || "Failed to load drafts.");
        })
        .finally(() => {
          if (active) setIsLoadingDrafts(false);
        });
    }

    return () => {
      active = false;
    };
  }, [activeTab]);

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === "history") {
      setIsLoadingHistory(true);
      setHistoryError("");
    } else {
      setIsLoadingDrafts(true);
      setDraftsError("");
    }
  };

  const handleRefresh = () => {
    if (activeTab === "history") {
      setIsLoadingHistory(true);
      setHistoryError("");
      void loadHistory();
    } else {
      setIsLoadingDrafts(true);
      setDraftsError("");
      void loadDrafts(activeTab);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setGenerateError("Please enter a topic.");
      return;
    }
    if (!sourceNotes.trim()) {
      setGenerateError("Please provide lesson notes for the AI to analyze.");
      return;
    }

    setIsGenerating(true);
    setGenerateError("");
    setGenerateSuccess("");

    try {
      const count = parseInt(requestedCount, 10) || 5;
      const res = await generateAIDrafts({
        topic: topic.trim(),
        sourceNotes: sourceNotes.trim(),
        requestedCount: count,
        questionType,
        difficulty,
      });

      if (res.generatedCount === 0) {
        setGenerateError(
          res.message || "The AI could not generate valid questions from these notes. Please provide more detailed notes and try again."
        );
      } else {
        setGenerateSuccess(
          res.message || `${res.generatedCount} draft question(s) generated! Review and approve them below.`
        );
        if (res.drafts && res.drafts.length > 0) {
          setDrafts(res.drafts);
        }
      }
      setActiveTab("pending");
      setIsLoadingDrafts(true);
      setDraftsError("");
      await loadDrafts("pending");
    } catch (err) {
      setGenerateError(err.message || "Failed to generate questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (draftId) => {
    setApprovingDraftId(draftId);
    try {
      await approveAIDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
      setGenerateSuccess("Question approved and added to your Question Bank!");
    } catch (err) {
      setDraftsError(err.message || "Failed to approve draft.");
    } finally {
      setApprovingDraftId(null);
    }
  };

  const handleReject = async (draftId) => {
    try {
      await rejectAIDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
    } catch (err) {
      setDraftsError(err.message || "Failed to reject draft.");
    }
  };

  const handleDelete = async (draftId) => {
    try {
      await deleteAIDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
    } catch (err) {
      setDraftsError(err.message || "Failed to delete draft.");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDraft) return;

    setIsUpdatingDraft(true);
    setEditError("");
    try {
      const res = await updateAIDraft(editingDraft._id, {
        questionText: editingDraft.questionText,
        options: editingDraft.options,
        explanation: editingDraft.explanation,
        difficulty: editingDraft.difficulty,
        points: Number(editingDraft.points),
      });

      setDrafts((prev) =>
        prev.map((d) => (d._id === res.draft._id ? res.draft : d))
      );
      setEditingDraft(null);
    } catch (err) {
      setEditError(err.message || "Failed to save draft changes.");
    } finally {
      setIsUpdatingDraft(false);
    }
  };

  const tabs = [
    { label: "Pending Review", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Generation History", value: "history" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="text-[#5149B8]" size={26} />
            AI Question Generator
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Generate customized exam questions directly from your syllabus or lecture notes.
          </p>
        </div>

        <ActionButton
          label="View Question Bank"
          variant="secondary"
          icon={<BookOpen size={16} />}
          onClick={() => navigate("/teacher/questions")}
        />
      </header>

      {/* Generator Form */}
      <SectionCard
        title="Draft questions from lesson notes"
        description="Paste lecture notes or chapter text. The AI creates questions for your personal review before saving."
      >
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          {generateError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {generateError}
            </div>
          )}
          {generateSuccess && (
            <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {generateSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Topic"
              placeholder="e.g. Cellular Respiration, Calculus Integrals"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                Count (1-10)
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={requestedCount}
                  onChange={(e) => setRequestedCount(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#5149B8]"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                Type
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none focus:border-[#5149B8] bg-white"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                Difficulty
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none focus:border-[#5149B8] bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            Lesson Notes or Reference Text
            <textarea
              rows={5}
              placeholder="Paste relevant teaching notes, concepts, definitions, or textbook excerpt here (up to 20,000 characters)..."
              value={sourceNotes}
              onChange={(e) => setSourceNotes(e.target.value)}
              className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#5149B8] font-sans"
              required
            />
          </label>

          <div className="flex justify-end pt-2">
            <ActionButton
              type="submit"
              label={isGenerating ? "Analyzing notes & generating..." : "Generate AI Questions"}
              icon={<Sparkles size={16} />}
              disabled={isGenerating}
            />
          </div>
        </form>
      </SectionCard>

      {/* Drafts Management */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
          <button
            type="button"
            onClick={handleRefresh}
            className="text-xs font-semibold text-[#5149B8] hover:underline"
          >
            Refresh
          </button>
        </div>

        {draftsError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {draftsError}
          </div>
        )}
        {activeTab === "history" && historyError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {historyError}
          </div>
        )}

        {/* Pending / Approved / Rejected Views */}
        {activeTab !== "history" && (
          <div className="flex flex-col gap-4">
            {isLoadingDrafts ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading AI drafts…</p>
            ) : drafts.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="font-semibold text-slate-600">No {activeTab} drafts found.</p>
                {activeTab === "pending" && (
                  <p className="text-xs mt-1">Use the generator above to draft questions from your lesson notes.</p>
                )}
              </div>
            ) : (
              drafts.map((draft, idx) => (
                <div
                  key={draft._id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Question {idx + 1}
                      </span>
                      <StatusBadge label={draft.topic} variant="open" />
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 capitalize">
                        {draft.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">· {draft.points} pts</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {draft.reviewStatus === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(draft._id)}
                            disabled={approvingDraftId !== null}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {approvingDraftId === draft._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            <span>
                              {approvingDraftId === draft._id
                                ? "Adding..."
                                : "Approve & Add"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDraft(draft)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(draft._id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(draft._id)}
                            className="inline-flex items-center rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                      {draft.reviewStatus === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1">
                          <Check size={13} /> Approved to Question Bank
                        </span>
                      )}
                      {draft.reviewStatus === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 font-bold text-xs px-3 py-1">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {draft.questionText}
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {draft.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium border ${
                          opt.isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-bold"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="size-5 rounded-full flex items-center justify-center bg-white border border-slate-200 text-[10px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt.text}</span>
                        {opt.isCorrect && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {draft.explanation && (
                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-800">Explanation: </span>
                      {draft.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* History View */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-3">
            {isLoadingHistory ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading generation history…</p>
            ) : generations.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No generation history recorded.</p>
            ) : (
              generations.map((gen) => (
                <div
                  key={gen._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{gen.topic}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(gen.createdAt).toLocaleString()} · {gen.questionType === "true_false" ? "True/False" : "Multiple choice"} ({gen.difficulty})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-slate-600">
                      Generated: <span className="font-bold text-slate-900">{gen.generatedCount ?? 0}</span>
                    </span>
                    <span className="text-emerald-700">
                      Accepted: <span className="font-bold">{gen.acceptedCount ?? 0}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {editingDraft && (
        <Modal
          isOpen={Boolean(editingDraft)}
          onClose={() => setEditingDraft(null)}
          title="Edit AI Draft"
        >
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            {editError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {editError}
              </div>
            )}

            <Input
              label="Question Text"
              value={editingDraft.questionText}
              onChange={(e) =>
                setEditingDraft({ ...editingDraft, questionText: e.target.value })
              }
              required
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">Options (select correct answer):</label>
              {editingDraft.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctEditOption"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const updated = editingDraft.options.map((o, i) => ({
                        ...o,
                        isCorrect: i === idx,
                      }));
                      setEditingDraft({ ...editingDraft, options: updated });
                    }}
                    className="accent-[#5149B8]"
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...editingDraft.options];
                      updated[idx] = { ...updated[idx], text: e.target.value };
                      setEditingDraft({ ...editingDraft, options: updated });
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#5149B8]"
                    required
                  />
                </div>
              ))}
            </div>

            <Input
              label="Explanation"
              value={editingDraft.explanation || ""}
              onChange={(e) =>
                setEditingDraft({ ...editingDraft, explanation: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <ActionButton
                type="submit"
                label={isUpdatingDraft ? "Saving..." : "Save Changes"}
                disabled={isUpdatingDraft}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
