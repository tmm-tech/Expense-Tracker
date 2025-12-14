import { useState } from "react";
import {
  FileTextIcon,
  DownloadIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";
import Sidebar from "../Component/Sidebar";

export default function Reports() {
  const [range, setRange] = useState("YTD");

  const reports = [
    {
      id: "monthly",
      title: "Monthly Summary",
      description:
        "Income, expenses, savings, and cash flow for the selected period.",
      icon: FileTextIcon,
    },
    {
      id: "category",
      title: "Spending by Category",
      description: "Detailed breakdown of expenses by category and trends.",
      icon: BarChartIcon,
    },
    {
      id: "networth",
      title: "Net Worth Report",
      description: "Assets, liabilities, and net worth progression over time.",
      icon: FileTextIcon,
    },
  ];

  function exportReport(type, format) {
    console.log(`Exporting ${type} as ${format} for ${range}`);
    // backend integration later
  }

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2>Reports</h2>
            <p>Analyze and export your financial data</p>
          </div>

          {/* RANGE SELECTOR */}
          <div style={styles.range}>
            {["1M", "3M", "YTD", "ALL"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  ...styles.rangeBtn,
                  background:
                    range === r ? "rgba(77,163,255,0.2)" : "transparent",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* REPORT CARDS */}
        <div style={styles.grid}>
          {reports.map((r) => {
            const Icon = r.icon;

            return (
              <div className="card" key={r.id}>
                {/* CARD HEADER */}
                <div style={styles.cardHeader}>
                  <div style={styles.titleRow}>
                    <Icon />
                    <h3>{r.title}</h3>
                  </div>
                  <span style={styles.badge}>{range}</span>
                </div>

                {/* DESCRIPTION */}
                <p style={styles.description}>{r.description}</p>

                {/* ACTIONS */}
                <div style={styles.actions}>
                  <button
                    style={styles.actionBtn}
                    onClick={() => exportReport(r.id, "PDF")}
                  >
                    <DownloadIcon /> PDF
                  </button>
                  <button
                    style={styles.actionBtn}
                    onClick={() => exportReport(r.id, "CSV")}
                  >
                    <DownloadIcon /> CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER NOTE */}
        <div style={styles.note}>
          Reports are generated using your latest synced data and may take a few
          seconds to prepare.
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
  },

  range: {
    display: "flex",
    gap: 6,
    padding: 4,
    borderRadius: 20,
    background: "rgba(255,255,255,0.08)",
  },

  rangeBtn: {
    border: "none",
    padding: "6px 14px",
    borderRadius: 16,
    color: "white",
    cursor: "pointer",
    background: "transparent",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 24,
    marginTop: 24,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  badge: {
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    background: "rgba(255,255,255,0.08)",
    color: "var(--text-secondary)",
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  actions: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },

  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: "rgba(77,163,255,0.15)",
    color: "white",
  },

  note: {
    marginTop: 24,
    fontSize: 13,
    color: "var(--text-secondary)",
  },
};
