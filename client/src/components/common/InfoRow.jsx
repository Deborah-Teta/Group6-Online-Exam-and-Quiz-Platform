function InfoRow({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-[16px]">
      <Icon size={21} strokeWidth={1.6} className="shrink-0 text-primary" />
      <div className="flex min-w-0 flex-col gap-[5px] leading-[1.55]">
        <p className="text-[14px] font-semibold text-main">{title}</p>
        <p className="text-[13px] text-muted">{children}</p>
      </div>
    </div>
  );
}

export default InfoRow;
