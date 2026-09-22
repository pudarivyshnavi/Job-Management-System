function Toast({ message, type = "success" }) {
  if (!message) {
    return null;
  }
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

export default Toast;
