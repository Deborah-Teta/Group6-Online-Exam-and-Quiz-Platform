function InfoRow({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-[16px]">
      <Icon size={21} strokeWidth={1.6} className="shrink-0 text-[#5149b8]" />
      <div className="flex min-w-0 flex-col gap-[5px] leading-[1.55]">
        <p className="text-[14px] font-semibold text-[#202536]">{title}</p>
        <p className="text-[13px] text-[#6d7180]">{children}</p>
      </div>
    </div>
  );
}

export default InfoRow;
