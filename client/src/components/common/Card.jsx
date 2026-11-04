function Card({ children, className = "" }) {
  return (
    <div className={`rounded-md border border-line bg-card text-left shadow-xs ${className}`}>
      {children}
    </div>
  );
}

export default Card;
