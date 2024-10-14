import { Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Dashboard from './Page/Dashboard';
import Transactions from './Page/Transactions';
function App() {
  return (
    <div className="App">
      <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </div>
  );
}

export default App;
