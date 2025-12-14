export default function TopBar() {
  return (
    <div style={styles.bar}>
      <div>
        <h2>Dashboard</h2>
        <p>Overview of your financial health</p>
      </div>

      <div style={styles.right}>
        <div style={styles.pill}>May 2025</div>
        <div style={styles.avatar}>👤</div>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    height: 72,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  right: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  pill: {
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.08)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};