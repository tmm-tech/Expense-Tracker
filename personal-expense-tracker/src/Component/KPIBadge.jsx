export default function KPIBadge({ current, previous }) {
  const diff = current - previous;
  const percent = ((diff / previous) * 100).toFixed(1);

  return (
    <span style={{ marginLeft: 8, fontSize: 15, color: diff >= 0 ? "#10b981" : "#ef4444" }}
      className={`badge ${diff >= 0 ? "positive" : "negative"}`}
    >
      {diff >= 0 ? "▲" : "▼"} {Math.abs(percent)}%
    </span>
  );
}