import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import Sidebar from "../Component/Sidebar";

export default function Investments() {
  const portfolio = {
    totalValue: 35200,
    totalGain: 4200,
    gainPercent: 13.5,
  };

  const assets = [
    {
      symbol: "AAPL",
      name: "Apple",
      value: 12000,
      allocation: 34,
      change: 2.8,
    },
    {
      symbol: "VTI",
      name: "Vanguard Total Market",
      value: 15000,
      allocation: 43,
      change: 1.4,
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      value: 8200,
      allocation: 23,
      change: -3.2,
    },
  ];

  const insights = [
    "📈 Your portfolio is up 13.5% overall — strong performance.",
    "⚖️ You are well diversified across equities and crypto.",
    "💡 BTC volatility is increasing — consider rebalancing if risk-averse.",
  ];

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2>Investments</h2>
            <p>Your portfolio performance & allocation</p>
          </div>
          <div style={styles.range}>YTD</div>
        </div>

        {/* PORTFOLIO SUMMARY */}
        <div className="card" style={styles.summary}>
          <div>
            <p>Total Portfolio Value</p>
            <h2 className="amount">${portfolio.totalValue.toLocaleString()}</h2>
          </div>

          <div>
            <p>Total Gain</p>
            <h2 className="amount" style={{ color: "var(--green)" }}>
              +${portfolio.totalGain.toLocaleString()}
            </h2>
          </div>

          <div>
            <p>Return</p>
            <h2 className="amount" style={{ color: "var(--green)" }}>
              +{portfolio.gainPercent}%
            </h2>
          </div>
        </div>

        {/* AI INSIGHTS */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3>Insights</h3>
          <div style={styles.insights}>
            {insights.map((i, idx) => (
              <p key={idx}>{i}</p>
            ))}
          </div>
        </div>

        {/* ASSETS */}
        <div style={styles.grid}>
          {assets.map((a) => (
            <div className="card" key={a.symbol}>
              {/* HEADER */}
              <div style={styles.assetHeader}>
                <div>
                  <strong>{a.symbol}</strong>
                  <p>{a.name}</p>
                </div>

                <span
                  style={{
                    color: a.change >= 0 ? "var(--green)" : "var(--red)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {a.change >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {Math.abs(a.change)}%
                </span>
              </div>

              {/* VALUE */}
              <h3 className="amount">${a.value.toLocaleString()}</h3>

              {/* ALLOCATION */}
              <div style={styles.allocation}>
                <div style={styles.allocationBg}>
                  <div
                    style={{
                      ...styles.allocationFill,
                      width: `${a.allocation}%`,
                    }}
                  />
                </div>
                <span>{a.allocation}% of portfolio</span>
              </div>

              {/* CTA */}
              <button style={styles.link}>View details</button>
            </div>
          ))}
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
  },

  range: {
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.08)",
  },

  summary: {
    marginTop: 24,
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 24,
  },

  insights: {
    display: "grid",
    gap: 8,
    marginTop: 8,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 24,
    marginTop: 24,
  },

  assetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  allocation: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  allocationBg: {
    height: 8,
    borderRadius: 8,
    background: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },

  allocationFill: {
    height: "100%",
    background: "linear-gradient(90deg,var(--blue),var(--green))",
    borderRadius: 8,
  },

  link: {
    marginTop: 12,
    background: "none",
    border: "none",
    color: "var(--blue)",
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
  },
};
