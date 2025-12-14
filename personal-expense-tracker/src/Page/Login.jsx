import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LockClosedIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate auth request
    setTimeout(() => {
      setLoading(false);
      if (!email || !password) {
        setError("Please enter your email and password.");
      } else {
        console.log("Login:", { email, password });
      }
    }, 800);
  }

  return (
    <div style={styles.wrapper}>
      {/* BRAND */}
      <div style={styles.brand}>
        <h1>
          Aure<span style={{ color: "var(--blue)" }}>X</span>
        </h1>
        <p>Secure personal finance dashboard</p>
      </div>

      {/* CARD */}
      <form className="card" style={styles.card} onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p style={styles.subtitle}>
          Sign in to continue to your dashboard
        </p>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* EMAIL */}
        <div style={styles.field}>
          <EnvelopeClosedIcon />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* PASSWORD */}
        <div style={styles.field}>
          <LockClosedIcon />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <label style={styles.remember}>
            <input type="checkbox" />
            Remember me
          </label>

          <button type="button" style={styles.link}>
            Forgot password?
          </button>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submit,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* FOOTER */}
        <p style={styles.footer}>
          Don’t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
    padding: 24,
  },

  brand: {
    maxWidth: 320,
  },

  card: {
    width: 380,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  subtitle: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  field: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
  },

  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 14,
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
  },

  remember: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  submit: {
    marginTop: 8,
    padding: "12px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg,#4da3ff,#2cff9a)",
    color: "black",
    fontWeight: 600,
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 8,
  },

  link: {
    background: "none",
    border: "none",
    color: "var(--blue)",
    cursor: "pointer",
    padding: 0,
  },

  error: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(255,92,124,0.2)",
    fontSize: 13,
  },
};