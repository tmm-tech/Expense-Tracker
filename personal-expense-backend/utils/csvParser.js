const { parse } = require("csv-parse");

module.exports.parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    parse(
      buffer,
      {
        columns: true,
        trim: true,
        skip_empty_lines: true,
      },
      (err, records) => {
        if (err) return reject(err);

        const parsed = records.map((row, index) => {
          if (!row.date || !row.amount || !row.name) {
            throw new Error(`Invalid CSV format at row ${index + 1}`);
          }

          return {
            name: row.name,
            category: row.category || "Uncategorized",
            amount: Number(row.amount),
            date: new Date(row.date),
          };
        });

        resolve(parsed);
      }
    );
  });
};