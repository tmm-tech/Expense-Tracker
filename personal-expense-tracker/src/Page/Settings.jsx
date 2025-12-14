import { useState } from "react";
import {
  MoonIcon,
  BellIcon,
  GlobeIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import Sidebar from "../Component/Sidebar";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [emailReports, setEmailReports] = useState(false);
  const [currency, setCurrency] = useState("USD");

  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2>Settings</h2>
            <p>Manage your account preferences</p>
          </div>
        </div>

        {/* APPEARANCE */}
        <section className="card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <MoonIcon />
            <h3>Appearance</h3>
          </div>

          <SettingRow
            label="Dark mode"
            description="Reduce eye strain and save battery life"
          >
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </SettingRow>
        </section>

        {/* NOTIFICATIONS */}
        <section className="card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <BellIcon />
            <h3>Notifications</h3>
          </div>

          <SettingRow
            label="Monthly email reports"
            description="Receive a summary of your finances each month"
          >
            <Toggle checked={emailReports} onChange={setEmailReports} />
          </SettingRow>
        </section>

        {/* REGIONAL */}
        <section className="card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <GlobeIcon />
            <h3>Regional</h3>
          </div>

          <SettingRow
            label="Currency"
            description="Choose how amounts are displayed"
          >
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={styles.select}
            >
              <option  value="USD">USD – US Dollar</option>
              <option value="EUR">EUR – Euro</option>
              <option value="GBP">GBP – British Pound</option>
              <option value="KES">KES – Kenya Shilling</option>
            </select>
          </SettingRow>
        </section>

        {/* SECURITY */}
        <section className="card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <LockClosedIcon />
            <h3>Security</h3>
          </div>

          <SettingRow
            label="Change password"
            description="Update your account password regularly"
          >
            <button style={styles.secondaryBtn}>Update</button>
          </SettingRow>

          <SettingRow
            label="Sign out of all sessions"
            description="Log out from all devices"
          >
            <button style={styles.dangerBtn}>Sign out</button>
          </SettingRow>
        </section>
      </main>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function SettingRow({ label, description, children }) {
  return (
    <div style={styles.row}>
      <div>
        <strong>{label}</strong>
        <p style={styles.description}>{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        ...styles.toggle,
        background: checked ? "var(--blue)" : "rgba(255,255,255,0.2)",
      }}
    >
      <div
        style={{
          ...styles.knob,
          transform: checked ? "translateX(18px)" : "translateX(0)",
        }}
      />
    </button>
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
    marginBottom: 24,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  description: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginTop: 2,
  },

  toggle: {
    width: 42,
    height: 24,
    borderRadius: 20,
    border: "none",
    padding: 3,
    cursor: "pointer",
    transition: "background 0.2s ease",
  },

  knob: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "white",
    transition: "transform 0.2s ease",
  },

  select: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.1)",
    color: "white",
    border: "none",
  },

  secondaryBtn: {
    padding: "6px 14px",
    borderRadius: 10,
    border: "none",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    cursor: "pointer",
  },

  dangerBtn: {
    padding: "6px 14px",
    borderRadius: 10,
    border: "none",
    background: "rgba(255,92,124,0.25)",
    color: "white",
    cursor: "pointer",
  },
};
