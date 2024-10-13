import { Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Dashboard from './Page/Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
            <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
