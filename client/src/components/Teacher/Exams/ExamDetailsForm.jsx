import Input from "../../common/Input";

function ExamDetailsForm({ values, classes, onChange, endTime }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm sm:p-6">
      <h2 className="mb-5 text-sm font-bold text-slate-900">Exam details</h2>

      <div className="flex flex-col gap-4">
        <Input
          label="Exam title"
          name="exam-title"
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="e.g. Cell Biology Checkpoint"
          required
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="exam-class" className="text-xs font-medium text-slate-700">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            id="exam-class"
            value={values.classId}
            onChange={(event) => onChange("classId", event.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Select a class</option>
            {classes.map((teacherClass) => (
              <option key={teacherClass.id} value={teacherClass.id}>
                {teacherClass.name} · {teacherClass.students} students
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Start date"
            name="exam-start-date"
            type="date"
            value={values.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            required
          />

          <Input
            label="Start time"
            name="exam-start-time"
            type="time"
            value={values.startTime}
            onChange={(event) => onChange("startTime", event.target.value)}
            required
          />

          <div className="flex w-full flex-col gap-1.5">
            <label htmlFor="exam-timezone" className="text-xs font-medium text-slate-700">
              Time zone
            </label>
            <select
              id="exam-timezone"
              value={values.timeZone}
              onChange={(event) => onChange("timeZone", event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#5149B8] focus:ring-4 focus:ring-blue-100"
            >
              <option value="CAT">Africa/Kigali · CAT (Kigali time)</option>
              <option value="GMT">Europe/London · GMT</option>
            </select>
          </div>
        </div>

        <Input
          label="Duration (minutes)"
          name="exam-duration"
          type="number"
          value={values.duration}
          onChange={(event) => onChange("duration", event.target.value)}
          min="1"
          required
        />

        <p className="-mt-2 text-[11px] text-slate-500">
          Scheduled window ends at {endTime}.
        </p>
      </div>
    </section>
  );
}

export default ExamDetailsForm;