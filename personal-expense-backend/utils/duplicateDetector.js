function isDuplicate(row, existing) {
  return existing.some((tx) => {
    return (
      tx.amount === row.amount &&
      tx.description === row.description &&
      new Date(tx.date).getTime() ===
        new Date(row.date).getTime()
    );
  });
}

module.exports = isDuplicate;