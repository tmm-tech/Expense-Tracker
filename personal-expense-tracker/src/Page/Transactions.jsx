import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@radix-ui/react-icons";
import Sidebar from "../Component/Sidebar";

export default function Transactions() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const transactions = [
    {
      id: 1,
      date: "2025-05-02",
      name: "Salary",
      category: "Income",
      amount: 4500,
    },
    {
      id: 2,
      date: "2025-05-01",
      name: "Starbucks",
      category: "Food",
      amount: -5.6,
    },
    {
      id: 3,
      date: "2025-05-01",
      name: "Netflix",
      category: "Entertainment",
      amount: -15,
    },
    {
      id: 4,
      date: "2025-04-30",
      name: "Uber",
      category: "Travel",
      amount: -18.2,
    },
  ];

  const filtered = transactions.filter((t) => {
    const matchesQuery = t.name
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "income" && t.amount > 0) ||
      (filter === "expense" && t.amount < 0);

    return matchesQuery && matchesFilter;
  });

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2>Transactions</h2>
          <p>Your recent financial activity</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        <div style={styles.search}>
          <MagnifyingGlassIcon />
          <input
            placeholder="Search transactions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.filters}>
          {["all", "income", "expense"].map((f) => (
            <button
            class="capitalize"
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background:
                  filter === f
                    ? "rgba(38, 50, 63, 0.2)"
                    : "transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="card" style={{ marginTop: 16 }}>
        <table width="100%">
          <thead>
            <tr style={styles.headRow}>
              <th align="left">Date</th>
              <th align="left">Merchant</th>
              <th align="left">Category</th>
              <th align="right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} style={styles.row}>
                <td>{t.date}</td>
                <td>
                  <strong>{t.name}</strong>
                </td>
                <td>{t.category}</td>
                <td align="right">
                  <span
                    style={{
                      ...styles.amount,
                      color:
                        t.amount > 0
                          ? "var(--green)"
                          : "var(--red)",
                    }}
                  >
                    {t.amount > 0 ? (
                      <ArrowUpIcon />
                    ) : (
                      <ArrowDownIcon />
                    )}
                    ${Math.abs(t.amount)}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" style={styles.empty}>
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </main>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
  },

  main: {
    flex: 1,
    padding: 32,
    overflowY: "auto",
  },
  
  header: {
    marginBottom: 12,
  },

  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
    flexWrap: "wrap",
  },

  search: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
  },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "white",
  },

  filters: {
    display: "flex",
    gap: 8,
  },

  filterBtn: {
    padding: "6px 14px",
    borderRadius: 16,
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  headRow: {
    color: "var(--text-secondary)",
    fontSize: 13,
  },

  row: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  amount: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 600,
  },

  empty: {
    textAlign: "center",
    padding: 24,
    color: "var(--text-secondary)",
  },
};