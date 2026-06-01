import { useEffect } from "react";
import ReactDOM from "react-dom";

function Modal({
  isOpen,
  onClose,
  type = "info", // "info", "warning", "success", "error"
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
  closeOnBackdrop = true,
  showClose = true,
  confirmDisabled = false,
}) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarning = type === "warning";
  const isInfo = type === "info";

  const renderIcon = () => {
    if (isSuccess) {
      return (
        <svg viewBox="0 0 52 52" className="modal-icon__svg" aria-hidden="true">
          <circle className="modal-icon__circle" cx="26" cy="26" r="24" />
          <path className="modal-icon__check" d="M14 27l8 8 17-18" />
        </svg>
      );
    }
    if (isError) {
      return (
        <svg viewBox="0 0 52 52" className="modal-icon__svg" aria-hidden="true">
          <circle className="modal-icon__circle" cx="26" cy="26" r="24" />
          <path className="modal-icon__cross" d="M18 18l16 16M34 18L18 34" />
        </svg>
      );
    }
    if (isWarning) {
      return (
        <svg viewBox="0 0 52 52" className="modal-icon__svg" aria-hidden="true">
          <circle className="modal-icon__circle" cx="26" cy="26" r="24" />
          <path className="modal-icon__mark" d="M26 14v16" />
          <path className="modal-icon__dot" d="M26 38h.01" />
        </svg>
      );
    }
    // Info icon
    return (
      <svg viewBox="0 0 52 52" className="modal-icon__svg" aria-hidden="true">
        <circle className="modal-icon__circle" cx="26" cy="26" r="24" />
        <path className="modal-icon__mark" d="M26 24v14" />
        <path className="modal-icon__dot" d="M26 15h.01" />
      </svg>
    );
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && showClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-dialog modal-dialog--${type}`} role="dialog" aria-modal="true">
        {showClose && (
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        )}

        <div className={`modal-icon modal-icon--${type}`}>
          {renderIcon()}
        </div>

        <div className="modal-content">
          {title && <h2 className="modal-title">{title}</h2>}
          {message && <div className="modal-message">{message}</div>}
        </div>

        <div className="modal-actions">
          {cancelText && (
            <button
              type="button"
              className="button button--ghost modal-btn modal-btn--cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="button modal-btn modal-btn--confirm"
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
