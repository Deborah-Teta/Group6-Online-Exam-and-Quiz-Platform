import { useState } from "react";
import { Copy, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../common/ActionButton";
import Card from "../../common/Card";
import DataTable from "../../common/DataTable";
import StatusBadge from "../../common/StatusBadge";
import Tabs from "../../common/Tabs";

function formatDateTime(dateValue) {
  return new Date(dateValue).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Kigali",
  }) + " CAT";
}

function getExamStatus(exam) {
  if (exam.status === "draft") return { status: "closed", label: "Draft" };
  if (exam.status === "closed") return { status: "closed", label: "Closed" };
  const endTime = new Date(exam.startTime).getTime() + (Number(exam.durationMinutes) || 0) * 60_000;
  if (endTime < Date.now()) return { status: "closed", label: "Closed" };
  if (new Date(exam.startTime).getTime() <= Date.now()) {
    return { status: "open", label: "In progress" };
  }
  return { status: "upcoming", label: "Upcoming" };
}

const studentColumns = [
  { key: "name", header: "Student" },
  { key: "email", header: "School email" },
  {
    key: "joinedAt",
    header: "Joined class",
    render: (student) => formatDateTime(student.joinedAt),
  },
  {
    key: "status",
    header: "Status",
    render: () => <StatusBadge label="Enrolled" variant="open" />,
  },
];

const examColumns = [
  { key: "title", header: "Assessment" },
  {
    key: "startTime",
    header: "Schedule · CAT",
    render: (exam) => formatDateTime(exam.startTime),
  },
  {
    key: "status",
    header: "Status",
    render: (exam) => {
      const { status, label } = getExamStatus(exam);
      return <StatusBadge label={label} variant={status} />;
    },
  },
];

function ClassDetails({ teacherClass, onCopyCode, copied }) {
  const [activeTab, setActiveTab] = useState("students");
  const navigate = useNavigate();
  const upcomingExams = teacherClass.exams.filter((exam) => {
    const examStatus = getExamStatus(exam);
    return examStatus.status === "upcoming" || examStatus.status === "open";
  });
  const completedExams = teacherClass.exams.filter(
    (exam) => getExamStatus(exam).status === "closed" && exam.status !== "draft",
  );
  const tabs = [
    { label: "Students", value: "students", count: teacherClass.students.length },
    { label: "Exams", value: "exams", count: teacherClass.exams.length },
    { label: "Class settings", value: "settings" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {teacherClass.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {teacherClass.description || "No class description"}
          </p>
        </div>
        <ActionButton
          label="Create exam"
          onClick={() => navigate(`/teacher/exams?classId=${teacherClass.id}`)}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-slate-500">Enrolled students</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {teacherClass.students.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Students in this class</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">Class assessments</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {teacherClass.exams.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {upcomingExams.length} upcoming · {completedExams.length} completed
          </p>
        </Card>

        <Card className="flex items-center justify-between gap-3 bg-[#F0EFFD] p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5149B8]">
              Share with your students
            </p>
            <p className="mt-2 text-lg font-semibold text-[#5149B8]">
              {teacherClass.code}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Students join from their dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onCopyCode}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy code"}
          </button>
        </Card>
      </section>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "students" && (
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Student roster</h2>
            <span className="text-xs text-slate-500">
              {teacherClass.students.length} students
            </span>
          </div>
          <DataTable
            columns={studentColumns}
            rows={teacherClass.students}
            emptyMessage="No students have joined this class yet."
          />
        </Card>
      )}

      {activeTab === "exams" && (
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Class assessments
          </h2>
          <DataTable
            columns={examColumns}
            rows={teacherClass.exams}
            emptyMessage="There are no assessments for this class yet."
          />
        </Card>
      )}

      {activeTab === "settings" && (
        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Class settings</h2>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <GraduationCap size={18} className="text-[#5149B8]" />
            <span>{teacherClass.description || "No class description"}</span>
          </div>
          <p className="text-sm text-slate-600">
            Joining code: <strong>{teacherClass.code}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Status: <strong>{teacherClass.active ? "Active" : "Inactive"}</strong>
          </p>
        </Card>
      )}
    </div>
  );
}

export default ClassDetails;
