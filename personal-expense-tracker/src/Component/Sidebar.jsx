import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  DashboardIcon,
  BarChartIcon,
  PieChartIcon,
  CardStackIcon,
  GearIcon,
  ReaderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

const iconMap = {
  Dashboard: DashboardIcon,
  Transactions: CardStackIcon,
  Budgets: PieChartIcon,
  Investments: BarChartIcon,
  Reports: ReaderIcon,
  Settings: GearIcon,
};

export default function Sidebar({ role = "user" }) {
  const [collapsed, setCollapsed] = useState(false);
  const navRefs = useRef([]);

  const menu = [
    { label: "Dashboard", path: "/", roles: ["user", "admin"] },
    { label: "Transactions", path: "/transactions", roles: ["user", "admin"] },
    { label: "Budgets", path: "/budgets", roles: ["user", "admin"] },
    { label: "Investments", path: "/investments", roles: ["user", "admin"] },
    { label: "Reports", path: "/reports", roles: ["user","admin"] },
    { label: "Settings", path: "/settings", roles: ["user", "admin"] },
  ];

  const visibleMenu = menu.filter((item) =>
    item.roles.includes(role)
  );

  /* Keyboard navigation (↑ ↓) */
  useEffect(() => {
    function handleKeyDown(e) {
      const activeIndex = navRefs.current.findIndex(
        (el) => el === document.activeElement
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        navRefs.current[(activeIndex + 1) % navRefs.current.length]?.focus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        navRefs.current[
          (activeIndex - 1 + navRefs.current.length) %
            navRefs.current.length
        ]?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: collapsed ? 80 : 260,
      }}
    >
      {/* Logo + Collapse Toggle */}
      <div style={styles.logoRow}>
        <h2 style={styles.logo}>
          {collapsed ? "A" : "Aure"}
          <span style={{ color: "var(--blue)" }}>X</span>
        </h2>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={styles.toggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Navigation */}
      <nav>
        {visibleMenu.map((item, i) => {
          const Icon = iconMap[item.label];

          return (
            <NavLink
              key={item.label}
              to={item.path}
              ref={(el) => (navRefs.current[i] = el)}
              tabIndex={0}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.active : {}),
              })}
            >
              <Icon style={styles.icon} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  sidebar: {
    height: "100vh",
    padding: 20,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.12)",
    transition: "width 0.3s ease",
    overflow: "hidden",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  logo: {
    fontWeight: 700,
    fontSize: 20,
  },

  toggle: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 12,
    marginBottom: 8,
    color: "var(--text-primary)",
    textDecoration: "none",
    cursor: "pointer",
    outline: "none",
    transition: "background 0.25s ease, box-shadow 0.25s ease",
  },

  icon: {
    width: 20,
    height: 20,
    flexShrink: 0,
  },

  active: {
    background: "rgba(77,163,255,0.15)",
    boxShadow: "0 0 20px rgba(77,163,255,0.25)",
  },
};