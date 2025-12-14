import { useState } from "react";
import { Link } from "react-router-dom";
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated register call
    setTimeout(() => {
      setLoading(false);

      if (!name || !email || !password) {
        setError("All fields are required.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      console.log("Register:", { name, email, password });
    }, 900);
  }

  return (
    <div style={styles.wrapper}>
      {/* BRAND */}
      <div style={styles.brand}>
        <h1>
          Aure<span style={{ color: "var(--blue)" }}>X</span>
        </h1>
        <p>Your all-in-one personal finance platform</p>
      </div>

      {/* CARD */}
      <form className="card" style={styles.card} onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <p style={styles.subtitle}>
          Start tracking, budgeting, and investing smarter
        </p>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* NAME */}
        <div style={styles.field}>
          <PersonIcon />
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

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
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* PASSWORD HINT */}
        <div style={styles.hint}>
          Use at least 8 characters with a mix of letters and numbers.
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
          {loading ? "Creating account…" : "Create account"}
        </button>

        {/* FOOTER */}
        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>

        {/* TRUST */}
        <p style={styles.trust}>
          🔒 Your data is encrypted and never shared
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
    width: 400,
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

  hint: {
    fontSize: 12,
    color: "var(--text-secondary)",
    marginTop: -4,
  },

  submit: {
    marginTop: 10,
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
    marginTop: 6,
  },

  link: {
    background: "none",
    border: "none",
    color: "var(--blue)",
    cursor: "pointer",
    padding: 0,
  },

  trust: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    color: "var(--text-secondary)",
  },

  error: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(255,92,124,0.2)",
    fontSize: 13,
  },
};