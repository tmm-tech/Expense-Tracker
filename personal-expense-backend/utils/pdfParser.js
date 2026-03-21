const { parseEquityLine } = require("./LineParser");

exports.parseEquityPDF = (text) => {
  const lines = text.split("\n");

  const rows = [];

  for (const line of lines) {
    if (
      line.includes("VISA") ||
      line.includes("MPESA") ||
      line.includes("APP")
    ) {
      const parsed = parseEquityLine(line);

      if (parsed) rows.push(parsed);
    }
  }

  return rows;
};