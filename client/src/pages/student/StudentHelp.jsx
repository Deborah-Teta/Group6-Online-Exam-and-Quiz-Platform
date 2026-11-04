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
    <>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        {/* Common questions */}
        <SectionCard title="Common questions" action={`${visibleQuestions.length} shown`}>
          <Tabs tabs={helpTopics} activeTab={activeTopic} onChange={setActiveTopic} />
          <Accordion key={activeTopic} items={visibleQuestions} />
        </SectionCard>

        <div className="flex flex-col gap-6">
          {/* Guidelines */}
          <SectionCard title="Exam and quiz guidelines">
            <div className="flex flex-col gap-6">
              {helpGuidelines.map(({ icon, title, text }) => (
                <InfoRow key={title} icon={icon} title={title}>
                  {text}
                </InfoRow>
              ))}
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Still need help?">
            <p className="text-[13px] leading-[1.55] text-muted">
              Speak to your teacher. If the problem is during an exam or quiz, tell them before it closes.
            </p>

            <div className="flex flex-col gap-[12px]">
              {enrolledClasses.map(({ id, name, teacher }) => (
                <div key={id} className="flex flex-col leading-[1.55]">
                  <p className="text-[13px] font-bold text-slate-900">{teacher}</p>
                  <p className="text-xs text-slate-500">{name}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}

export default StudentHelp;
