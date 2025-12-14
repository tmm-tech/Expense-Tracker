export function getAlert(spent, limit) {
  const pct = spent / limit;
  if (pct >= 1) return "OVER_BUDGET";
  if (pct >= 0.85) return "NEAR_LIMIT";
  return null;
}
