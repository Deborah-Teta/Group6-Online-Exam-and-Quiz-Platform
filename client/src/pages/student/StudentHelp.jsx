import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Accordion from "../../components/common/Accordion";
import InfoRow from "../../components/common/InfoRow";
import SectionCard from "../../components/common/SectionCard";
import Tabs from "../../components/common/Tabs";
import {
  helpGuidelines,
  helpQuestions,
  helpTopics,
} from "../../services/studentHelpContent";

function StudentHelp() {
  const { enrolledClasses } = useOutletContext();
  const [activeTopic, setActiveTopic] = useState("all");

  const visibleQuestions =
    activeTopic === "all"
      ? helpQuestions
      : helpQuestions.filter((question) => question.topic === activeTopic);

  return (
    <div className="flex flex-col gap-[28px]">
      {/* Page heading */}
      <div className="flex flex-col gap-[6px]">
        <p className="text-[30px] leading-[1.2] text-[#202536]">Help &amp; guidelines</p>
        <p className="text-[14px] leading-[1.55] text-[#6d7180]">
          How your exams and quizzes work, and what to do if something goes wrong.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-[24px] xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Common questions */}
        <SectionCard title="Common questions" action={`${visibleQuestions.length} shown`}>
          <Tabs tabs={helpTopics} activeTab={activeTopic} onChange={setActiveTopic} />
          <Accordion key={activeTopic} items={visibleQuestions} />
        </SectionCard>

        <div className="flex flex-col gap-[24px]">
          {/* Guidelines */}
          <SectionCard title="Exam and quiz guidelines">
            <div className="flex flex-col gap-[24px]">
              {helpGuidelines.map(({ icon, title, text }) => (
                <InfoRow key={title} icon={icon} title={title}>
                  {text}
                </InfoRow>
              ))}
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Still need help?">
            <p className="text-[13px] leading-[1.55] text-[#6d7180]">
              Speak to your teacher. If the problem is during an exam or quiz, tell them before it closes.
            </p>

            <div className="flex flex-col gap-[12px]">
              {enrolledClasses.map(({ id, name, teacher }) => (
                <div key={id} className="flex flex-col leading-[1.55]">
                  <p className="text-[13px] font-semibold text-[#202536]">{teacher}</p>
                  <p className="text-[11px] text-[#6d7180]">{name}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default StudentHelp;
