import { X } from "lucide-react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) {
  const sizes = {
    sm: "max-w-[384px]",
    md: "max-w-[540px]",
    lg: "max-w-[672px]",
    xl: "max-w-[896px]",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(32,37,54,0.4)] p-[16px]"
      onClick={onClose}
    >
      <div
        className={`
          relative w-full ${sizes[size]}
          max-h-full overflow-y-auto rounded-[12px] bg-white p-[20px] text-left
          shadow-[0px_16px_64px_0px_rgba(32,37,54,0.13)] sm:p-[32px]
        `}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-[22px] flex items-start justify-between gap-[16px]">
          <p
            id="modal-title"
            className="text-[23px] font-semibold leading-normal text-[#202536]"
          >
            {title}
          </p>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-[7px] p-[4px] text-[#6d7180] transition-colors hover:bg-[#f7f7f2] hover:text-[#202536]"
              aria-label="Close modal"
            >
              <X size={18} strokeWidth={1.6} />
            </button>
          )}
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
