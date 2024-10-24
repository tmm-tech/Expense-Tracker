import { Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Dashboard from './Page/Dashboard';
import Transactions from './Page/Transactions';
import Budget from './Page/Budget';
import Goals from './Page/Goals';
import Settings from './Page/Settings';
import LoginPage from './Page/LoginPage';
function App() {
  return (
    <div className="App">
      <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
