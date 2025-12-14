export default function BottomSheet({ open, children }) {
  if (!open) return null;

  return (
    <div style={styles.sheet}>
      <div style={styles.handle} />
      {children}
    </div>
  );
}

const styles = {
  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    background: "var(--bg-main)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  handle: {
    width: 40,
    height: 4,
    background: "#555",
    margin: "0 auto 8px",
    borderRadius: 4,
  },
};