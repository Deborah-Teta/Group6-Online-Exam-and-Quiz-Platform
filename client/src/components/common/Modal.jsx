
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  if (!isOpen) return null;

  return (
    <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6"
  onClick={onClose}
>
  <div
    className={`
      relative flex max-h-[calc(100dvh-1.5rem)] w-full ${sizes[size]}
      flex-col overflow-hidden rounded-2xl bg-white shadow-xl
    `}
    onClick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <h2
        id="modal-title"
        className="text-lg font-semibold text-slate-900"
      >
        {title}
      </h2>

      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close modal"
        >
          ✕
        </button>
      )}
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      {children}
    </div>
  </div>
</div>
  );
}

export default Modal;
