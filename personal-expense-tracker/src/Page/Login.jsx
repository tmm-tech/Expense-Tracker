import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LockClosedIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 300);
  }, []);

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
      {/* ANIMATED BACKGROUND */}
      <div style={styles.gradient} />
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />
      <div style={{ ...styles.orb, ...styles.orb3 }} />

      {/* CONTENT */}
      <div style={styles.content}>
        {/* BRAND */}
        <div
          style={{
            ...styles.brand,
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <h1 style={styles.logo}>
            Aure<span style={styles.logoAccent}>X</span>
          </h1>
          <p className="tagline">
            <span>Smart. </span>
            <span>Secure. </span>
            <span>Personal </span>
            <span>Finance.</span>
          </p>
        </div>

        {/* CARD */}
        <form
          className="card login-card"
          style={{
            ...styles.card,
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
          }}
          onSubmit={handleSubmit}
        >
          <h2>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to continue to your dashboard</p>

          {/* ERROR */}
          {error && <div style={styles.error}>{error}</div>}

          {/* EMAIL */}
          <div className="input-wrapper" style={styles.field}>
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
          <div className="input-wrapper" style={styles.field}>
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
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  wrapper: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  gradient: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(120deg,#0f172a,#020617,#020617,#0b1220)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 20s ease infinite",
  },

  orb: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.5,
    animation: "float 18s ease-in-out infinite",
  },

  orb1: {
    background: "#4da3ff",
    top: "10%",
    left: "15%",
  },

  orb2: {
    background: "#2cff9a",
    bottom: "15%",
    right: "20%",
    animationDelay: "4s",
  },

  orb3: {
    background: "#a78bfa",
    top: "40%",
    right: "35%",
    animationDelay: "8s",
  },

  content: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    gap: 80,
    alignItems: "center",
  },

  brand: {
    maxWidth: 480,
    transition: "all 0.8s ease",
  },

  logo: {
    fontSize: 68,
    fontWeight: 900,
    letterSpacing: "-1.5px",
    lineHeight: 1.1,
    background: "linear-gradient(90deg,#ffffff,#c7d2fe,#ffffff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "logoShimmer 6s ease infinite",
  },

  logoAccent: {
    color: "#4da3ff",
    background: "linear-gradient(90deg,#4da3ff,#2cff9a)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  card: {
    width: 380,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    backdropFilter: "blur(20px)",
    transition: "all 0.8s ease",
  },

  subtitle: {
    fontSize: 14,
    color: "#9aa4bf",
  },

  field: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    transition: "box-shadow 0.3s ease, background 0.3s ease",
  },

  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
  },

  submit: {
    marginTop: 10,
    padding: "12px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg,#4da3ff,#2cff9a)",
    fontWeight: 600,
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 8,
  },

  link: {
    color: "#4da3ff",
  },
   error: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(255,92,124,0.2)",
    fontSize: 13,
  },
};
