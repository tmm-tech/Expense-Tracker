export default function TimeRangeSelector({ value, onChange }) {
  const ranges = ["1M", "3M", "YTD"];

  return (
    <div style={styles.wrapper}>
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          style={{
            ...styles.btn,
            background:
              value === r ? "rgba(77,163,255,0.2)" : "transparent",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    gap: 8,
    padding: 4,
    borderRadius: 20,
    background: "rgba(255,255,255,0.08)",
  },
  btn: {
    border: "none",
    color: "white",
    padding: "6px 14px",
    borderRadius: 16,
    cursor: "pointer",
    background: "transparent",
  },
};