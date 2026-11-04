function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-100 bg-white text-left shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default Card;
