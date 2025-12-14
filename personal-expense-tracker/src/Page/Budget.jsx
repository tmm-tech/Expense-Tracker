import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HamburgerMenuIcon,
  HomeIcon,
  VideoIcon
} from "@radix-ui/react-icons";
import Sidebar from "../Component/Sidebar";


/* CATEGORY ICONS */
const icons = {
  Food: HamburgerMenuIcon,
  Rent: HomeIcon,
  Entertainment: VideoIcon,
  Travel: VideoIcon,
};

export default function Budgets() {
  const [expanded, setExpanded] = useState(null);

  const budgets = [
    {
      category: "Food",
      spent: 420,
      limit: 500,
      rollover: 80,
      transactions: [
        { name: "Starbucks", amount: -5.6 },
        { name: "Groceries", amount: -120 },
      ],
    },
    {
      category: "Rent",
      spent: 1200,
      limit: 1200,
      rollover: 0,
      transactions: [{ name: "Apartment Rent", amount: -1200 }],
    },
    {
      category: "Entertainment",
      spent: 260,
      limit: 300,
      rollover: 40,
      transactions: [{ name: "Netflix", amount: -15 }],
    },
    {
      category: "Travel",
      spent: 180,
      limit: 400,
      rollover: 120,
      transactions: [{ name: "Flight", amount: -180 }],
    },
  ];

  return (
        <div style={styles.wrapper}>
          <Sidebar />
          <main style={styles.main}>
      <h2>Budgets</h2>
      <p>Smarter monthly planning with rollovers & insights</p>

      <div style={styles.grid}>
        {budgets.map((b, i) => {
          const totalAvailable = b.limit + b.rollover;
          const percent = (b.spent / totalAvailable) * 100;
          const Icon = icons[b.category];

          let color = "var(--blue)";
          let insight = "On track";

          if (percent > 70) insight = "Approaching limit";
          if (percent >= 100) {
            color = "var(--red)";
            insight = "Reduce spending by $" + Math.ceil(b.spent - totalAvailable);
          }

          return (
            <motion.div
              key={b.category}
              className="card"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* HEADER */}
              <div style={styles.header}>
                <div style={styles.category}>
                  <Icon />
                  <h3>{b.category}</h3>
                </div>
                <span style={{ color }}>{Math.round(percent)}%</span>
              </div>

              {/* AMOUNTS */}
              <p>
                ${b.spent} of ${totalAvailable} available
              </p>

              {/* ROLLOVER */}
              {b.rollover > 0 && (
                <p style={{ color: "var(--green)" }}>
                  +${b.rollover} rolled over
                </p>
              )}

              {/* PROGRESS */}
              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progress,
                    width: `${Math.min(percent, 100)}%`,
                    background: color,
                  }}
                />
              </div>

              {/* AI INSIGHT */}
              <div style={styles.aiBox}>
                🤖 <span>{insight}</span>
              </div>

              {/* DRILL DOWN */}
              <button
                style={styles.link}
                onClick={() =>
                  setExpanded(expanded === i ? null : i)
                }
              >
                View transactions
              </button>

              {/* TRANSACTIONS */}
              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {b.transactions.map((t, idx) => (
                      <div key={idx} style={styles.tx}>
                        <span>{t.name}</span>
                        <span style={{ color: "var(--red)" }}>
                          ${Math.abs(t.amount)}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 24,
    marginTop: 24,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  category: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  progressBg: {
    height: 8,
    borderRadius: 8,
    background: "rgba(255,255,255,0.1)",
    marginTop: 8,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: 8,
    transition: "width 0.3s ease",
  },

  aiBox: {
    marginTop: 10,
    padding: "6px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    fontSize: 13,
  },

  link: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "var(--blue)",
    cursor: "pointer",
    padding: 0,
  },

  tx: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: 14,
  },
};