import { parse } from "csv-parse";

export function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    parse(
      buffer,
      { columns: true, trim: true },
      (err, records) => {
        if (err) reject(err);
        resolve(
          records.map((r) => ({
            name: r.name,
            category: r.category,
            amount: parseFloat(r.amount),
            date: new Date(r.date),
          }))
        );
      }
    );
  });
}