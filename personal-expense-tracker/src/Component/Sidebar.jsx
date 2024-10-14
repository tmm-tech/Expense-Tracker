import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "Transactions", icon: FileText },
    { name: "Budget", icon: BarChart2 },
    { name: "Goals", icon: Target },
    { name: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-white bg-opacity-90 w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative lg:translate-x-0 z-10`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Expense Tracker</h2>
        <button
          className="lg:hidden text-gray-800 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={`/${item.name.toLowerCase()}`}
                className="flex items-center space-x-2 text-gray-700 hover:bg-gray-200 rounded p-2 transition-colors duration-200"
              >
                <item.icon className="h-5 w-5 text-gray-600" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
