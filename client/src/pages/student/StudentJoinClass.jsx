import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { BookOpen, Info, Search } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import SectionCard from "../../components/common/SectionCard";
import StatusBadge from "../../components/common/StatusBadge";
import { mockAvailableClasses, mockStudent } from "../../services/studentMockData";

function FoundClass({ foundClass, onConfirm }) {
  return (
    <Card className="flex flex-col items-start gap-[20px] p-[24px]">
      <StatusBadge label="Class found" variant="open" />

      <div className="flex size-[52px] items-center justify-center rounded-[12px] bg-[#eeedf9]">
        <BookOpen size={25} strokeWidth={1.6} className="text-[#5149b8]" />
      </div>

      <div className="flex w-full flex-col gap-[8px]">
        <p className="text-[29px] font-semibold leading-normal text-[#202536]">{foundClass.name}</p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">{foundClass.description}</p>
      </div>

      <div className="h-px w-full bg-[#e3e4e8]" />

      <div className="text-[13px] leading-[1.55] text-[#202536]">
        <p>Teacher: {foundClass.teacher}</p>
        <p>School: {mockStudent.school}</p>
        <p>Joining code: {foundClass.code}</p>
      </div>

      <div className="flex w-full items-start gap-[12px] rounded-[7px] bg-[#f0f0ea] p-[16px]">
        <Info size={19} strokeWidth={1.6} className="shrink-0 text-[#6d7180]" />
        <div className="flex flex-col gap-[4px] leading-[1.55] text-[#6d7180]">
          <p className="text-[13px] font-semibold">Is this your class?</p>
          <p className="text-[12px]">Confirm the teacher and class name before joining.</p>
        </div>
      </div>

      <Button label="Confirm & join class" onClick={onConfirm} />
    </Card>
  );
}

function StudentJoinClass() {
  const navigate = useNavigate();
  const { enrolledClasses, joinClass } = useOutletContext();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [foundClass, setFoundClass] = useState(null);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
    setError("");
    setFoundClass(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const enteredCode = code.trim().toUpperCase();

    if (!enteredCode) {
      setError("Enter the joining code from your teacher.");
      return;
    }

    const match = mockAvailableClasses.find((item) => item.code === enteredCode);

    if (!match) {
      setError("We couldn't find a class with that code. Check it with your teacher.");
    } else if (enrolledClasses.some((item) => item.id === match.id)) {
      setError(`You're already in ${match.name}.`);
    } else {
      setFoundClass(match);
    }
  };

  const handleConfirm = () => {
    joinClass(foundClass);
    navigate("/student/classes");
  };

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <p className="text-[30px] leading-[1.2] text-[#202536]">Find your classroom</p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">
          Enter the joining code your teacher shared with you.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-[28px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <SectionCard title="Enter a class code">
          <p className="text-[14px] leading-[1.55] text-[#6d7180]">
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
              <Button type="submit" label="Find class" icon={<Search size={16} strokeWidth={1.6} />} />
              <Button
                label="Cancel"
                variant="secondary"
                onClick={() => navigate("/student/classes")}
              />
            </div>
          </form>

          <div className="h-px bg-[#e3e4e8]" />

          <p className="text-[12px] leading-[1.55] text-[#6d7180]">
            Joining a class lets you see its exams. Your teacher can see your name and exam results.
          </p>
        </SectionCard>

        {foundClass && <FoundClass foundClass={foundClass} onConfirm={handleConfirm} />}
      </div>
    </div>
  );
}

export default StudentJoinClass;
