import { useState } from "react";
import { Plus } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import ClassesList from "../../components/Teacher/Classes/Classes list";
import CreateClass from "../../components/Teacher/Classes/Create class";
import ClassDetails from "../../components/Teacher/Classes/class details";
import Modal from "../../components/common/Modal";

const initialClasses = [
  {
    id: "biology-10a",
    name: "Biology 10A",
    description: "Year 10 · Biology",
    students: 8,
    code: "BIO10A",
    active: true,
    nextItem: "Cell Biology Checkpoint",
    nextSchedule: "Today, 10:00 GMT",
  },
  {
    id: "biology-10b",
    name: "Biology 10B",
    description: "Year 10 · Biology",
    students: 32,
    code: "BIO10B",
    active: true,
    nextItem: "Plant Cells Practice",
    nextSchedule: "Today, 14:00 GMT",
  },
  {
    id: "science-9a",
    name: "Science 9A",
    description: "Year 9 · Combined science",
    students: 28,
    code: "SCI09A",
    active: true,
    nextItem: "Forces & Motion",
    nextSchedule: "Fri 30 Oct, 09:00 GMT",
  },
  {
    id: "science-enrichment",
    name: "Science enrichment",
    description: "Mixed years · Science",
    students: 28,
    code: "ENRICH",
    active: true,
    nextItem: "Scientific Method",
    nextSchedule: "Mon 2 Nov, 15:30 GMT",
  },
];

const codeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createJoinCode() {
  const values = new Uint8Array(6);
  window.crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => codeCharacters[value % codeCharacters.length],
  ).join("");
}

function TeacherClasses() {
  const [classes, setClasses] = useState(initialClasses);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedClassId, setCopiedClassId] = useState("");
  const [copyError, setCopyError] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  const activeClasses = classes.filter((teacherClass) => teacherClass.active);
  const studentCount = activeClasses.reduce(
    (total, teacherClass) => total + teacherClass.students,
    0,
  );

  function handleCreateClass({ name, description }) {
    const newClass = {
      id: `class-${Date.now()}`,
      name,
      description,
      students: 0,
      code: createJoinCode(),
      active: true,
      nextItem: "No upcoming assessments",
      nextSchedule: "Schedule an exam to see it here",
    };

    setClasses((current) => [newClass, ...current]);
    setIsCreateOpen(false);
  }

  async function handleCopyCode(teacherClass) {
    setCopyError("");
    setCopiedClassId("");

    try {
      await navigator.clipboard.writeText(teacherClass.code);
      setCopiedClassId(teacherClass.id);
      window.setTimeout(() => setCopiedClassId(""), 1800);
    } catch {
      setCopyError(
        `Could not copy the joining code for ${teacherClass.name}. You can select and copy it manually.`,
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Your classes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A home for every group you teach, {activeClasses.length} active
            {activeClasses.length === 1 ? " class" : " classes"} · {studentCount}{" "}
            students.
          </p>
        </div>

        <ActionButton
          label="Create class"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateOpen(true)}
        />
      </section>

      <ClassesList
        classes={classes}
        copiedClassId={copiedClassId}
        copyError={copyError}
        onCopyCode={handleCopyCode}
        onOpenClass={(teacherClass) => setSelectedClass(teacherClass)}
      />

      <CreateClass
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateClass}
      />
      <Modal
  isOpen={Boolean(selectedClass)}
  onClose={() => setSelectedClass(null)}
  title={selectedClass ? `${selectedClass.name} details` : "Class details"}
  size="xl"
>
  {selectedClass && (
    <ClassDetails
      teacherClass={selectedClass}
      onCopyCode={() => handleCopyCode(selectedClass)}
      copied={copiedClassId === selectedClass.id}
    />
  )}
</Modal>
    </div>
  );
}

export default TeacherClasses;