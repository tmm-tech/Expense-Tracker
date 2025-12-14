import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div style={styles.wrapper}>
      <form className="card" style={styles.form}>
        <h2>Create Account</h2>
        <p>Start managing your finances</p>

        <input placeholder="Email" style={styles.input} />
        <input placeholder="Password" type="password" style={styles.input} />

        <button style={styles.button}>Register</button>

        <p>
          Have an account? <Link to="/login">Login</Link>
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
    background: "#2cff9a",
    border: "none",
    color: "black",
    cursor: "pointer",
  },
};
