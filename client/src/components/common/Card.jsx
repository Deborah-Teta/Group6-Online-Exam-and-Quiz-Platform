function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[10px] border border-[#e3e4e8] bg-white text-left ${className}`}>
      {children}
    </div>
  );
}

export default Card;
