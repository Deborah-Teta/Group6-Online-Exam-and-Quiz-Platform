import { useEffect, useState } from "react";

const emptyQuestion = {
  questionText: "",
  type: "multiple_choice",
  topic: "",
  points: 2,
  difficulty: "medium",
  source: "manual",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
};

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100";

function QuestionForm({ initialQuestion, isOpen, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(emptyQuestion);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      initialQuestion
        ? {
            ...initialQuestion,
            options: initialQuestion.options.map((option) => ({ ...option })),
          }
        : emptyQuestion,
    );
  }, [initialQuestion, isOpen]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeType(type) {
    updateField(
      "type",
      type,
    );

    if (type === "true_false") {
      setForm((current) => ({
        ...current,
        type,
        options: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      type,
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    }));
  }

  function updateOption(index, changes) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...changes } : option,
      ),
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, { text: "", isCorrect: false }],
    }));
  }

  function removeOption(index) {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      ...form,
      questionText: form.questionText.trim(),
      topic: form.topic.trim(),
      points: Number(form.points),
      options: form.options.map((option) => ({
        ...option,
        text: option.text.trim(),
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Question
        <textarea
          required
          rows={3}
          value={form.questionText}
          onChange={(event) => updateField("questionText", event.target.value)}
          placeholder="Write the question..."
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Type
          <select
            value={form.type}
            onChange={(event) => changeType(event.target.value)}
            className={fieldClass}
          >
            <option value="multiple_choice">Multiple choice</option>
            <option value="true_false">True / false</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Topic
          <input
            required
            value={form.topic}
            onChange={(event) => updateField("topic", event.target.value)}
            placeholder="e.g. Cell organelles"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Points
          <input
            required
            min="1"
            type="number"
            value={form.points}
            onChange={(event) => updateField("points", event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Difficulty
        <select
          value={form.difficulty}
          onChange={(event) => updateField("difficulty", event.target.value)}
          className={fieldClass}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-slate-700">
          Answer options <span className="text-xs text-slate-500">(select the correct answer)</span>
        </legend>

        {form.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-answer"
              checked={option.isCorrect}
              onChange={() =>
                setForm((current) => ({
                  ...current,
                  options: current.options.map((item, itemIndex) => ({
                    ...item,
                    isCorrect: itemIndex === index,
                  })),
                }))
              }
              aria-label={`Mark option ${index + 1} as correct`}
              className="accent-[#5149B8]"
            />

            <input
              required
              value={option.text}
              disabled={form.type === "true_false"}
              onChange={(event) =>
                updateOption(index, { text: event.target.value })
              }
              placeholder={`Option ${index + 1}`}
              className={fieldClass}
            />

            {form.type === "multiple_choice" && form.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="px-2 text-xs text-red-600 hover:text-red-700"
                aria-label={`Remove option ${index + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {form.type === "multiple_choice" && (
          <button
            type="button"
            onClick={addOption}
            className="w-fit text-xs font-semibold text-[#5149B8] hover:text-[#413B9A]"
          >
            + Add option
          </button>
        )}
      </fieldset>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-[#5149B8] px-4 py-2 text-xs font-bold text-white hover:bg-[#413B9A]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default QuestionForm;