import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import Sidebar from "../Component/Sidebar";

/* ===================== PAGE ===================== */

export default function Transactions() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  // 🔌 BACKEND (ENABLE LATER)
  // useEffect(() => {
  //   fetch("/api/transactions")
  // }, []);

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
            <p style={styles.subtext}>
              Track and manage your financial activity
            </p>
          </div>

          <button
            style={styles.addBtn}
            onClick={() => setShowAdd(true)}
          >
            <PlusIcon /> Add
          </button>
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
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  background:
                    filter === f
                      ? "rgba(77,163,255,0.18)"
                      : "transparent",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="card desktop-only" style={{ marginTop: 16 }}>
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

        {/* MOBILE CARDS */}
        {/* <div className="mobile-only" style={styles.mobileList}>
          {filtered.map((t) => (
            <div key={t.id} className="card" style={styles.mobileCard}>
              <div>
                <strong>{t.name}</strong>
                <div style={styles.mobileMeta}>
                  {t.category} • {t.date}
                </div>
              </div>
              <div
                style={{
                  ...styles.amount,
                  color:
                    t.amount > 0
                      ? "var(--green)"
                      : "var(--red)",
                }}
              >
                {t.amount > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                ${Math.abs(t.amount)}
              </div>
            </div>
          ))}
        </div>  */}
      </main>

      {/* ADD TRANSACTION MODAL */}
      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
    </div>
  );
}

/* ===================== ADD TRANSACTION ===================== */

function AddTransaction({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "",
  });

  function submit(e) {
    e.preventDefault();

    // 🔌 BACKEND (ENABLE LATER)
    // fetch("/api/transactions", { method: "POST", body: JSON.stringify(form) });

    onClose();
  }

  return (
    <div style={styles.overlay}>
      <form className="card" style={styles.modal} onSubmit={submit}>
        <h3>Add Transaction</h3>

        <input
          placeholder="Merchant"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Amount"
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />
        <input
          placeholder="Category"
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        />

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button>Add</button>
        </div>
      </form>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  wrapper: { display: "flex", height: "100vh" },
  main: { flex: 1, padding: 32, overflowY: "auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subtext: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  addBtn: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg,#4da3ff,#2cff9a)",
    fontWeight: 600,
    cursor: "pointer",
  },

  controls: {
    display: "flex",
    gap: 16,
    marginTop: 16,
    flexWrap: "wrap",
  },

  search: {
    display: "flex",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
  },

  input: {
    border: "none",
    background: "transparent",
    outline: "none",
    color: "white",
  },

  filters: { display: "flex", gap: 8 },

  filterBtn: {
    padding: "6px 14px",
    borderRadius: 16,
    border: "none",
    cursor: "pointer",
  },

  headRow: {
    fontSize: 13,
    color: "var(--text-secondary)",
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

  mobileList: {
    marginTop: 16,
    display: "grid",
    gap: 12,
  },

  mobileCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mobileMeta: {
    fontSize: 12,
    color: "var(--text-secondary)",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "fadeIn 0.2s ease-out",
  },

  modal: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "linear-gradient(135deg, rgba(30,30,40,0.95), rgba(20,20,30,0.95))",
    border: "1px solid rgba(77,163,255,0.2)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    animation: "slideUp 0.3s ease-out",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
};