function StatusBadge({ status }) {
  const tone = String(status || "").toLowerCase();
  return <span className={`status-badge status-${tone}`}>{status}</span>;
}

export default StatusBadge;
