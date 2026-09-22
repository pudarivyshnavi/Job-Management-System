function EmptyState({ title, message, children }) {
  return (
    <div className="empty-state">
      <svg
        aria-hidden="true"
        className="empty-icon"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M3 11h5l2 3h4l2-3h5" />
      </svg>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  );
}

export default EmptyState;
