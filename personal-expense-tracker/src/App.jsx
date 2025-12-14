import { Route, Routes } from "react-router-dom";
import Dashboard from "./Page/Dashboard";
import Login from "./Page/Login";
import Register from "./Page/Register";
import Transactions from "./Page/Transactions";
import Budget from "./Page/Budget";
import Investments from "./Page/Investments";
import Reports from "./Page/Reports";
import Settings from "./Page/Settings";
function App() {
  // const isAuthenticated = false;

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        /> */}
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budget />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
