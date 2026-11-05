import { useMemo, useState } from "react";
import Card from "../../common/Card";
import DataTable from "../../common/DataTable";

const PAGE_SIZE = 8;

function QuestionsList({ questions, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const topics = [...new Set(questions.map((question) => question.topic))];

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch = question.questionText.toLowerCase().includes(query);
      const matchesType =
        typeFilter === "all" || question.type === typeFilter;
      const matchesTopic =
        topicFilter === "all" || question.topic === topicFilter;
      const matchesSource =
        sourceFilter === "all" || question.source === sourceFilter;

      return matchesSearch && matchesType && matchesTopic && matchesSource;
    });
  }, [questions, search, typeFilter, topicFilter, sourceFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const visibleQuestions = filteredQuestions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const columns = [
    {
      key: "questionText",
      header: "Question",
      render: (question) => (
        <div className="max-w-xl">
          <p className="font-medium text-slate-800">{question.questionText}</p>
          {question.source === "ai" && (
            <span className="mt-1 inline-block rounded-full bg-[#EEF3FD] px-2 py-0.5 text-[10px] font-medium text-[#0B609D]">
              AI-drafted · Approved
            </span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (question) =>
        question.type === "multiple_choice" ? "Multiple choice" : "True / false",
    },
    { key: "topic", header: "Topic" },
    { key: "points", header: "Points" },
    {
      key: "actions",
      header: "Actions",
      render: (question) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="text-xs font-medium text-[#0B609D] hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(question)}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  function resetPageAnd(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
          Search
          <input
            value={search}
            onChange={(event) => resetPageAnd(setSearch, event.target.value)}
            placeholder="Search questions..."
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
          Question type
          <select
            value={typeFilter}
            onChange={(event) => resetPageAnd(setTypeFilter, event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">All types</option>
            <option value="multiple_choice">Multiple choice</option>
            <option value="true_false">True / false</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
          Topic
          <select
            value={topicFilter}
            onChange={(event) => resetPageAnd(setTopicFilter, event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">All topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
          Source
          <select
            value={sourceFilter}
            onChange={(event) => resetPageAnd(setSourceFilter, event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0B609D] focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">All sources</option>
            <option value="manual">Manual</option>
            <option value="ai">AI-drafted</option>
          </select>
        </label>
      </div>

      <DataTable
        columns={columns}
        rows={visibleQuestions}
        emptyMessage="No questions match these filters."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Showing{" "}
          {filteredQuestions.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filteredQuestions.length)} of{" "}
          {filteredQuestions.length} questions
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg px-2 py-1 text-[#0B609D] hover:bg-[#EEF3FD] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>{page} / {pageCount}</span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg px-2 py-1 text-[#0B609D] hover:bg-[#EEF3FD] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}

export default QuestionsList;