export default function BudgetAlert({ alert }) {
  if (!alert) return null;

  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        background:
          alert === "OVER_BUDGET"
            ? "rgba(255,92,124,0.2)"
            : "rgba(255,170,0,0.2)",
      }}
    >
      {alert === "OVER_BUDGET"
        ? "🚨 Budget exceeded"
        : "⚠️ Near budget limit"}
    </div>
  );
}
