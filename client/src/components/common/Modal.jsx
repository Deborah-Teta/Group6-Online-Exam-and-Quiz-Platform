import { X } from "lucide-react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
}) {
  const sizes = {
    sm: "max-w-[384px]",
    md: "max-w-[460px]",
    lg: "max-w-[672px]",
    xl: "max-w-[896px]",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-[16px] backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className={`
          flex max-h-full w-full flex-col overflow-hidden ${sizes[size]}
          animate-modal-pop rounded-lg bg-card text-left shadow-modal
        `}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-[16px] border-b border-line px-[22px] py-[18px]">
          <p
            id="modal-title"
            className="text-[16px] font-bold leading-normal text-main"
          >
            {title}
          </p>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-[4px] p-[4px] text-subtle transition-colors hover:bg-surface-hover hover:text-main"
              aria-label="Close modal"
            >
              <X size={18} strokeWidth={1.6} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto px-[22px] py-[20px]">
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-[10px] border-t border-line bg-surface-subtle px-[22px] py-[14px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
