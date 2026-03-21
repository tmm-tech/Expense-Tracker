exports.parseEquityLine = (line) => {
  try {
    const dateMatch = line.match(/\d{2}\/\d{2}\/\d{4}/);

    if (!dateMatch) return null;

    const date = dateMatch[0];

    const amountMatch = line.match(
      /(\d{1,3}(,\d{3})*(\.\d{2}))/
    );

    if (!amountMatch) return null;

    const amount = parseFloat(
      amountMatch[0].replace(/,/g, "")
    );

    const type = line.includes("MPESA")
      ? "income"
      : "expense";

    return {
      description: line,
      date,
      amount,
      type,
    };
  } catch {
    return null;
  }
};