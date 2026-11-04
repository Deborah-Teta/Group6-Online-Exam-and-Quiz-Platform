import Card from "./Card";

const StatCard = ({ icon, title, value, subtext }) => {
  return (
    <Card className="flex flex-col gap-[10px] p-[22px]">
      <div className="flex items-center justify-between gap-[8px]">
        <p className="text-[12px] leading-[1.55] text-[#6d7180]">{title}</p>
        {icon && <div className="text-[#5149b8]">{icon}</div>}
      </div>
      <p className="text-[32px] font-semibold leading-normal text-[#202536]">{value}</p>
      <p className="text-[11px] leading-[1.55] text-[#6d7180]">{subtext}</p>
    </Card>
  );
};

export default StatCard;
