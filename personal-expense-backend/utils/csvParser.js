exports.parseCSV = (text) => {
  const lines = text.split("\n");

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    if (!cols[0]) continue;

    const description = cols[0];
    const date = cols[1];

    const credit = parseFloat(cols[2]) || 0;
    const debit = parseFloat(cols[3]) || 0;

    const amount = credit > 0 ? credit : debit;

    const type = credit > 0 ? "income" : "expense";

    rows.push({
      description,
      date,
      amount,
      type,
    });
  }

  return rows;
};