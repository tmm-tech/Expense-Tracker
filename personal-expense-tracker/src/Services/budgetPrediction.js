export function predictNextBudget(history) {
  // history = [420, 460, 500]
  const weights = [0.5, 0.3, 0.2];

  const avg =
    history.slice(-3).reduce((sum, val, i) => sum + val * weights[i], 0);

  const trend = history.at(-1) - history.at(-2);
  return Math.round(avg + trend * 0.5);
}