export default function KPICard({ title, value, subtitle, color }) {
  return (
    <div className="card">
      <p>{title}</p>
      <h1
        className="amount"
        style={{
          background: color,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </h1>
      <p>{subtitle}</p>
    </div>
  );
}