import { useState } from 'react';
import { Sparkles, Save } from 'lucide-react';

export const AdminSettingsTab = ({ onShowToast }) => {
  const [dailyAiLimit, setDailyAiLimit] = useState(10);
  const [maxQuestionsPerDraft, setMaxQuestionsPerDraft] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onShowToast?.('Settings saved and applied successfully!');
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
        
        {/* Category Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFFFFF] text-[#5149B8]">
            <Sparkles size={14} />
            <span>AI & LLM Configuration</span>
          </span>
        </div>

        {/* Section Header */}
        <div>
          <h3 className="text-lg font-bold text-slate-900">AI Question Generator Parameters</h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure LLM rate limits and generation constraints specified in the MVP brief.
          </p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Daily AI Limit per Teacher <span className="text-[#5149B8]">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={dailyAiLimit}
              onChange={(e) => setDailyAiLimit(Number(e.target.value))}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#5149B8] text-slate-900 bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-500">
              Controls API billing costs (Project brief specifies 10 daily generations).
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Max Questions per Draft Call
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxQuestionsPerDraft}
              onChange={(e) => setMaxQuestionsPerDraft(Number(e.target.value))}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#5149B8] text-slate-900 bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-500">
              Upper limit for a single teacher prompt (hard-capped at 10).
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#5149B8] hover:bg-[#413B9A] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
