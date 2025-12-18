export function getGridSpan(size) {
  switch (size) {
    case "2x":
      return "span 2";
    case "full":
      return "1 / -1";
    default:
      return "span 1";
  }
}