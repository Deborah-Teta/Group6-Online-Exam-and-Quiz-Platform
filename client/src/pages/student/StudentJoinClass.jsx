import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BookOpen, Info, Search } from "lucide-react";
import Button from "../../components/common/ActionButton";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Notice from "../../components/common/Notice";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { findClassByCode, joinClass } from "../../services/studentService";

function FoundClass({ foundClass, onConfirm, isJoining }) {
  return (
    <Card className="flex flex-col items-start gap-[16px] p-[20px]">
      <StatusBadge label="Class found" variant="open" />

      <div className="flex size-[44px] items-center justify-center rounded-2xl bg-primary-light">
        <BookOpen size={20} strokeWidth={1.6} className="text-primary" />
      </div>

      <div className="flex w-full flex-col gap-[8px]">
        <p className="text-[20px] font-bold leading-[1.3] tracking-[-0.3px] text-main">{foundClass.name}</p>
        <p className="text-[14px] leading-[1.55] text-muted">{foundClass.description}</p>
      </div>

      <div className="h-px w-full bg-line" />

      <div className="text-[13px] leading-[1.55] text-main">
        <p>Teacher: {foundClass.teacher}</p>
        <p>Joining code: {foundClass.code}</p>
      </div>

      <div className="w-full">
        <Notice icon={Info} title="Is this your class?" variant="neutral">
          Confirm the teacher and class name before joining.
        </Notice>
      </div>

      <Button
        label={isJoining ? "Joining..." : "Confirm & join class"}
        onClick={onConfirm}
        disabled={isJoining}
      />
    </Card>
  );
}

function StudentJoinClass() {
  const navigate = useNavigate();
  const { refreshStudentData } = useOutletContext();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [foundClass, setFoundClass] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
    setError("");
    setFoundClass(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const enteredCode = code.trim().toUpperCase();

    if (!enteredCode) {
      setError("Enter the joining code from your teacher.");
      return;
    }

    setIsSearching(true);
    try {
      const match = await findClassByCode(enteredCode);
      if (match.alreadyJoined) {
        setError(`You're already in ${match.name}.`);
        setFoundClass(null);
      } else {
        setFoundClass(match);
      }
    } catch (requestError) {
      setError(requestError.message || "We couldn't find a class with that code.");
      setFoundClass(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = async () => {
    setIsJoining(true);
    setError("");
    try {
      await joinClass(foundClass.code);
      await refreshStudentData();
      navigate("/student/classes");
    } catch (requestError) {
      setError(requestError.message || "We couldn't join this class.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <SectionCard title="Enter a class code">
          <p className="text-[14px] leading-[1.55] text-muted">
            Every class has its own code. Check with your teacher if you don't have one.
          </p>

          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
            <Input
              label="Joining code"
              name="joiningCode"
              value={code}
              onChange={handleCodeChange}
              required
              error={error}
              helperText="Codes aren't case-sensitive. You can paste a code here."
            />

            <div className="flex flex-wrap gap-[12px]">
              <Button
                type="submit"
                label={isSearching ? "Searching..." : "Find class"}
                icon={<Search size={16} strokeWidth={1.6} />}
                disabled={isSearching}
              />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={() => navigate("/student/classes")}
              />
            </div>
          </form>

          <div className="h-px bg-line" />

          <p className="text-[12px] leading-[1.55] text-muted">
            Joining a class lets you see its exams. Your teacher can see your name and exam results.
          </p>
        </SectionCard>

        {foundClass && (
          <FoundClass
            foundClass={foundClass}
            onConfirm={handleConfirm}
            isJoining={isJoining}
          />
        )}
      </div>
    </>
  );
}

export default StudentJoinClass;
