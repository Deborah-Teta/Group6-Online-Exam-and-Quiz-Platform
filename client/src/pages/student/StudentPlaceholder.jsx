import Card from "../../components/common/Card";

// Stands in for a student page until its Figma design is implemented.
function StudentPlaceholder({ title }) {
  return (
    <Card className="p-[24px]">
      <p className="text-[17px] font-semibold text-[#202536]">{title}</p>
      <p className="mt-[6px] text-[14px] leading-[1.55] text-[#6d7180]">
        This page hasn't been built yet.
      </p>
    </Card>
  );
}

export default StudentPlaceholder;
