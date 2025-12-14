import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div style={styles.wrapper}>
      <form className="card" style={styles.form}>
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>

        <input placeholder="Email" style={styles.input} />
        <input placeholder="Password" type="password" style={styles.input} />

        <button style={styles.button}>Login</button>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "none",
  },
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    background: "#4da3ff",
    border: "none",
    color: "white",
    cursor: "pointer",
  },
};