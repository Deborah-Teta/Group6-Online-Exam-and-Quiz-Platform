import { useState } from "react";
import { Copy, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../common/ActionButton";
import Card from "../../common/Card";
import DataTable from "../../common/DataTable";
import StatusBadge from "../../common/StatusBadge";
import Tabs from "../../common/Tabs";

const students = [
  { id: "s1", name: "Amelia Brooks", email: "amelia.b@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s2", name: "Ethan Chen", email: "ethan.c@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s3", name: "Maya Patel", email: "maya.p@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s4", name: "Noah Williams", email: "noah.w@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s5", name: "Sofia Garcia", email: "sofia.g@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s6", name: "Oliver James", email: "oliver.j@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s7", name: "Isla Thompson", email: "isla.t@oakfield.edu", joined: "08 Sep 2026" },
  { id: "s8", name: "Leo Wilson", email: "leo.w@oakfield.edu", joined: "08 Sep 2026" },
];

const exams = [
  { id: "exam-1", title: "Cell Biology Checkpoint", schedule: "Today · 10:00 GMT", status: "upcoming", statusLabel: "Upcoming" },
  { id: "exam-2", title: "Plant Cells Practice", schedule: "Today · 14:00 GMT", status: "upcoming", statusLabel: "Upcoming" },
  { id: "exam-3", title: "Cell Transport Quiz", schedule: "30 Oct · 11:00 GMT", status: "closed", statusLabel: "Completed" },
];

const studentColumns = [
  { key: "name", header: "Student" },
  { key: "email", header: "School email" },
  { key: "joined", header: "Joined class" },
  {
    key: "status",
    header: "Status",
    render: () => <StatusBadge label="Active" variant="open" />,
  },
];

const examColumns = [
  { key: "title", header: "Exam" },
  { key: "schedule", header: "Schedule · GMT" },
  {
    key: "status",
    header: "Status",
    render: (exam) => (
      <StatusBadge label={exam.statusLabel} variant={exam.status} />
    ),
  },
];

function ClassDetails({ teacherClass, onCopyCode, copied }) {
  const [activeTab, setActiveTab] = useState("students");
  const navigate = useNavigate();

  const tabs = [
    { label: "Students", value: "students", count: teacherClass.students },
    { label: "Exams", value: "exams", count: exams.length },
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
            {teacherClass.description} · Dr. Sarah Morgan
          </p>
        </div>

        <ActionButton
          label="Create exam"
          onClick={() => navigate("/teacher/exams")}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-slate-500">Enrolled students</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {teacherClass.students}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Students in this class
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">Class exams</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {exams.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {exams.filter((exam) => exam.status === "upcoming").length} upcoming
            · {exams.filter((exam) => exam.status === "closed").length} completed
          </p>
        </Card>

        <Card className="flex items-center justify-between gap-3 bg-[#EEF3FD] p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0B609D]">
              Share with your students
            </p>
            <p className="mt-2 text-lg font-semibold text-[#0B609D]">
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
            <h2 className="text-base font-semibold text-slate-900">
              Student roster
            </h2>
            <span className="text-xs text-slate-500">
              {teacherClass.students} students
            </span>
          </div>
          <DataTable
            columns={studentColumns}
            rows={students.slice(0, teacherClass.students)}
            emptyMessage="No students have joined this class yet."
          />
        </Card>
      )}

      {activeTab === "exams" && (
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Class exams
          </h2>
          <DataTable
            columns={examColumns}
            rows={exams}
            emptyMessage="There are no exams for this class yet."
          />
        </Card>
      )}

      {activeTab === "settings" && (
        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Class settings
          </h2>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <GraduationCap size={18} className="text-[#0B609D]" />
            <span>{teacherClass.description}</span>
          </div>
          <p className="text-sm text-slate-600">
            Joining code: <strong>{teacherClass.code}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Class editing and archiving can be connected when those actions are
            available in the backend.
          </p>
        </Card>
      )}
    </div>
  );
}

export default ClassDetails;