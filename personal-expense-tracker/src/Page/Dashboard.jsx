import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AnimatedNumber from "../Component/AnimatedNumber";
import TimeRangeSelector from "../Component/TimeRangeSelector";
import NetWorthChart from "../Component/Charts/NetWorthChart";
import BudgetChart from "../Component/Charts/BudgetChart";
import { generateInsights } from "../Services/insights";
import Sidebar from "../Component/Sidebar";
import TopBar from "../Component/TopBar";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";

export default function Dashboard() {
  const [range, setRange] = useState("1M");

  const [widgets, setWidgets] = useState([
    { id: "networth", title: "Net Worth", type: "kpi", primary: true },
    { id: "cashflow", title: "Cash Flow", type: "kpi" },
    { id: "liability", title: "Liability", type: "kpi" },
    { id: "chart", title: "Net Worth Trend", type: "chart", wide: true },
    { id: "budget", title: "Budget Usage", type: "chart" },
  ]);

  const current = { spend: 2340, savings: 23, netWorth: 124560, liability: 5000 };
  const previous = { spend: 2160, savings: 25, netWorth: 120200, liability: 4800 };

  const insights = generateInsights(current, previous);

  function onDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setWidgets(items);
  }

  return (
    <div style={styles.wrapper}>
      <Sidebar />

      <main style={styles.main}>
        <TopBar />

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2>Overview</h2>
            <p style={styles.subtext}>Snapshot of your financial health</p>
          </div>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>

        {/* DASHBOARD GRID */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={styles.grid}
              >
                {widgets.map((w, index) => (
                  <Draggable key={w.id} draggableId={w.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`card ${w.wide ? "card-wide" : ""}`}
                        style={{
                          ...provided.draggableProps.style,
                          gridColumn: w.wide ? "span 2" : "auto",
                        }}
                      >
                        {/* WIDGET HEADER */}
                        <div style={styles.widgetHeader}>
                          <h3>{w.title}</h3>
                          <span
                            {...provided.dragHandleProps}
                            style={styles.dragHandle}
                            title="Drag to reorder"
                          >
                            <DragHandleDots2Icon />
                          </span>
                        </div>

                        {/* KPI */}
                        {w.type === "kpi" && (
                          <div style={styles.kpi}>
                            <h2
                              className="amount"
                              style={{
                                fontSize: w.primary ? 36 : 28,
                                color: w.id === "networth" ? "#10b981" : w.id === "liability" ? "#ef4444" : "inherit",
                              }}
                            >
                              <AnimatedNumber
                                value={
                                  w.id === "networth"
                                    ? current.netWorth
                                    : w.id === "cashflow"
                                    ? current.spend
                                    : current.liability
                                }
                                prefix={w.id === "liability" ? "-$" : "$"}
                              />
                            </h2>
                            <span style={styles.kpiMeta}>
                              {w.id === "networth"
                                ? "Total assets minus liabilities"
                                : w.id === "cashflow"
                                ? "Total spend this period"
                                : w.id === "liability"
                                ? "Total liabilities"
                                : "Net this period"}
                            </span>
                          </div>
                        )}
                        {w.id === "chart" && <NetWorthChart />}
                        {w.id === "budget" && <BudgetChart />}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {/* AI INSIGHTS */}
        <div className="card" style={styles.insights}>
          <h3>What changed</h3>
          <div style={styles.insightList}>
            {insights.map((i, idx) => (
              <div key={idx} style={styles.insightItem}>
                🤖 {i}
              </div>
            ))}
          </div>
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
    padding: 16,
  },

  subtext: {
    marginTop: 4,
    color: "var(--text-secondary)",
    fontSize: 14,
  },

  insights: {
    marginTop: 20,
  },

  insightList: {
    display: "grid",
    gap: 8,
    marginTop: 8,
  },

  insightItem: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    fontSize: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 24,
    marginTop: 24,
  },

  widgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  dragHandle: {
    cursor: "grab",
    opacity: 0.6,
  },

  kpi: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  kpiMeta: {
    fontSize: 13,
    color: "var(--text-secondary)",
  },
};
