import { useMemo, useState } from "react";

function QuestionBankPicker({ questions, selectedIds, onToggle }) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");

  const topics = [...new Set(questions.map((question) => question.topic))];

  const visibleQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch = question.questionText.toLowerCase().includes(query);
      const matchesTopic = topic === "all" || question.topic === topic;
      return matchesSearch && matchesTopic;
    });
  }, [questions, search, topic]);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900">
          Select bank questions
        </h2>
        <span className="text-[11px] text-slate-500">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="question-search" className="text-xs font-medium text-slate-700">
            Search questions
          </label>
          <input
            id="question-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="question-topic" className="text-xs font-medium text-slate-700">
            Topic
          </label>
          <select
            id="question-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">All topics</option>
            {topics.map((questionTopic) => (
              <option key={questionTopic} value={questionTopic}>
                {questionTopic}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleQuestions.map((question) => {
          const selected = selectedIds.includes(question.id);

          return (
            <label
              key={question.id}
              className="flex cursor-pointer items-start gap-3 py-3"
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(question.id)}
                className="mt-1 h-4 w-4 accent-[#5149B8]"
              />

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium leading-5 text-slate-800">
                  {question.questionText}
                </span>
                <span className="mt-1 block text-[10px] text-slate-500">
                  {question.typeLabel} · {question.topic}
                  {question.source === "ai" ? " · AI-drafted · Approved" : ""}
                </span>
              </span>

              <span className="shrink-0 text-[10px] text-slate-500">
                {question.points} pts
              </span>
            </label>
          );
        })}

        {visibleQuestions.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-500">
            No approved questions match these filters.
          </p>
        )}
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        Only manual and individually approved AI-drafted questions are shown.
      </p>
    </section>
  );
}

export default QuestionBankPicker;