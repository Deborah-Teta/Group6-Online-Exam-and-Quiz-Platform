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
    md: "max-w-[512px]",
    lg: "max-w-[672px]",
    xl: "max-w-[896px]",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-[16px]"
      onClick={onClose}
    >
      <div
        className={`
          relative w-full ${sizes[size]}
          rounded-[10px] border border-[#e3e4e8] bg-white p-[24px] text-left shadow-xl
        `}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-[16px] flex items-center justify-between gap-[16px]">
          <p
            id="modal-title"
            className="text-[17px] font-semibold leading-normal text-[#202536]"
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
              <X size={18} />
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
