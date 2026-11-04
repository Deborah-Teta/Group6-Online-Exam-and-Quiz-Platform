
function Loader({
  size = "md",
  message,
  fullScreen = false,
}) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-3
        ${fullScreen ? "min-h-screen" : "w-full py-6"}
      `}
      role="status"
      aria-live="polite"
    >
      <div
        className={`
          ${sizes[size]}
          animate-spin rounded-full
          border-slate-200 border-t-blue-800
        `}
      />

      {message && (
        <p className="text-sm font-medium text-slate-500">
          {message}
        </p>
      )}

      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Loader;
 
