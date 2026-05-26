function StatusMessage({
  type = "info",
  title,
  message,
  buttonText,
  onButtonClick,
  buttonTo,
}) {
  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarning = type === "warning";

  const iconClass = `status-message__icon ${
    isSuccess
      ? "is-success"
      : isError
        ? "is-error"
        : isWarning
          ? "is-warning"
          : "is-info"
  }`;
console.log("Status modal ran");
  const renderIcon = () => {
    if (isSuccess) {
      return (
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle className="status-message__circle" cx="26" cy="26" r="24" />
          <path className="status-message__check" d="M14 27l8 8 17-18" />
        </svg>
      );
    }

    if (isError) {
      return (
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle className="status-message__circle" cx="26" cy="26" r="24" />
          <path className="status-message__cross" d="M18 18l16 16M34 18L18 34" />
        </svg>
      );
    }

    if (isWarning) {
      return (
        <svg viewBox="0 0 52 52" aria-hidden="true">
          <circle className="status-message__circle" cx="26" cy="26" r="24" />
          <path className="status-message__mark" d="M26 14v16" />
          <path className="status-message__dot" d="M26 38h.01" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="status-message__circle" cx="26" cy="26" r="24" />
        <path className="status-message__mark" d="M26 24v14" />
        <path className="status-message__dot" d="M26 15h.01" />
      </svg>
    );
  };

  const renderButton = () => {
    if (!buttonText) return null;

    if (buttonTo) {
      return (
        <a href={buttonTo} className="button status-message__button">
          {buttonText}
        </a>
      );
    }

    return (
      <button
        type="button"
        className="button status-message__button"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    );
  };

  return (
    <div className={`status-message status-message--${type}`} role="status">
      <div className={iconClass}>{renderIcon()}</div>

      <div className="status-message__content">
        {title && <h3>{title}</h3>}
        {message && <p>{message}</p>}

        {renderButton()}
      </div>
    </div>
  );
}

export default StatusMessage;