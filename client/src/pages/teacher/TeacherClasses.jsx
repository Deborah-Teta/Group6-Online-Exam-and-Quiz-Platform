import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import ClassesList from "../../components/Teacher/Classes/Classes list";
import CreateClass from "../../components/Teacher/Classes/Create class";
import ClassDetails from "../../components/Teacher/Classes/class details";
import Modal from "../../components/common/Modal";
import {
  createTeacherClass,
  getTeacherClassDetails,
  getTeacherClasses,
} from "../../services/teacherService";

function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedClassId, setCopiedClassId] = useState("");
  const [copyError, setCopyError] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setClasses(await getTeacherClasses());
    } catch (error) {
      setLoadError(error.message || "Could not load your classes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    getTeacherClasses()
      .then((items) => {
        if (isCurrent) setClasses(items);
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message || "Could not load your classes.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadClasses]);

  const activeClasses = classes.filter((teacherClass) => teacherClass.active);
  const studentCount = activeClasses.reduce(
    (total, teacherClass) => total + teacherClass.students,
    0,
  );

  async function handleCreateClass(values) {
    const newClass = await createTeacherClass(values);
    setClasses((current) => [newClass, ...current]);
    return true;
  }

  async function handleOpenClass(teacherClass) {
    setSelectedClass(teacherClass);
    setClassDetails(null);
    setDetailsError("");
    setIsDetailsLoading(true);
    try {
      setClassDetails(await getTeacherClassDetails(teacherClass.id));
    } catch (error) {
      setDetailsError(error.message || "Could not load class details.");
    } finally {
      setIsDetailsLoading(false);
    }
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
            {isLoading
              ? "Loading your classes…"
              : `${activeClasses.length} active ${activeClasses.length === 1 ? "class" : "classes"} · ${studentCount} students.`}
          </p>
        </div>

        <ActionButton
          label="Create class"
          icon={<Plus size={16} />}
          onClick={() => setIsCreateOpen(true)}
        />
      </section>

      {loadError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{loadError}</span>
          <button type="button" onClick={loadClasses} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <ClassesList
        classes={classes}
        copiedClassId={copiedClassId}
        copyError={copyError}
        onCopyCode={handleCopyCode}
        onOpenClass={handleOpenClass}
        isLoading={isLoading}
      />

      <CreateClass
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateClass}
      />

      <Modal
        isOpen={Boolean(selectedClass)}
        onClose={() => {
          setSelectedClass(null);
          setClassDetails(null);
        }}
        title={selectedClass ? `${selectedClass.name} details` : "Class details"}
        size="xl"
      >
        {detailsError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 text-sm text-red-700"
          >
            <span>{detailsError}</span>
            <button
              type="button"
              onClick={() => handleOpenClass(selectedClass)}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}
        {isDetailsLoading && (
          <p role="status" className="text-sm text-slate-500">
            Loading class details…
          </p>
        )}
        {classDetails && !isDetailsLoading && (
          <ClassDetails
            teacherClass={classDetails}
            onCopyCode={() => handleCopyCode(classDetails)}
            copied={copiedClassId === classDetails.id}
          />
        )}
      </Modal>
    </div>
  );
}

export default TeacherClasses;
