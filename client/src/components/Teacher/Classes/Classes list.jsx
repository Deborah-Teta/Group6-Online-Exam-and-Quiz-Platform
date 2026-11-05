import { useMemo, useState } from "react";
import { BookOpen, Copy } from "lucide-react";
import Card from "../../common/Card";
import Input from "../../common/Input";

function ClassesList({
  classes,
  copiedClassId,
  copyError,
  onCopyCode,
  onOpenClass,
  isLoading,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const visibleClasses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return classes.filter((teacherClass) => {
      const matchesSearch =
        !query ||
        teacherClass.name.toLowerCase().includes(query) ||
        teacherClass.code.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && teacherClass.active) ||
        (statusFilter === "inactive" && !teacherClass.active);

      return matchesSearch && matchesStatus;
    });
  }, [classes, search, statusFilter]);

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Find a class"
          name="class-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by class name or joining code"
        />

        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor="class-status"
            className="text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="class-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="active">Active classes</option>
            <option value="inactive">Inactive classes</option>
            <option value="all">All classes</option>
          </select>
        </div>
      </section>

      {copyError && (
        <p role="alert" className="text-sm text-red-600">
          {copyError}
        </p>
      )}

      {visibleClasses.length > 0 ? (
        <section
          aria-label="Your classes"
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          {visibleClasses.map((teacherClass) => (
            <Card key={teacherClass.id} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#5149B8]">
                  <BookOpen size={19} />
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    teacherClass.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {teacherClass.active ? "Active" : "Inactive"}
                </span>
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-900">
                {teacherClass.name}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {teacherClass.description && `${teacherClass.description} · `}
                {teacherClass.students} {teacherClass.students === 1 ? "student" : "students"}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Joining code ·{" "}
                  <span className="font-medium text-slate-700">
                    {teacherClass.code}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => onCopyCode(teacherClass)}
                  className="rounded-lg p-2 text-[#5149B8] transition hover:bg-[#FFFFFF]"
                  aria-label={`Copy joining code for ${teacherClass.name}`}
                  title={
                    copiedClassId === teacherClass.id
                      ? "Copied"
                      : "Copy joining code"
                  }
                >
                  <Copy size={15} />
                </button>
              </div>

              {copiedClassId === teacherClass.id && (
                <p role="status" className="mt-1 text-xs text-emerald-700">
                  Joining code copied.
                </p>
              )}

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {teacherClass.nextItem}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {teacherClass.nextSchedule}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenClass(teacherClass)}
                    className="text-xs font-medium text-[#5149B8] transition hover:text-[#413B9A]"
                  >
                    Open class →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            {isLoading ? "Loading your classes…" : "No classes match your search."}
          </p>
          {!isLoading && (
            <p className="mt-1 text-xs text-slate-500">
              Try another class name or joining code, or change the status filter.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

export default ClassesList;