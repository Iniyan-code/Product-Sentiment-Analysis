import React from 'react';
import { BarChart2, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ darkMode, setDarkMode, isDemoMode, setIsDemoMode, status }) => {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 px-4 py-3 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BarChart2 className="text-white w-6 h-6" />
          </div>
          <span>Sentimeter <span className="text-blue-600 dark:text-blue-400">AI</span></span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-medium"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-all border ${isDemoMode
                ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                : 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
          >
            {isDemoMode ? 'Demo Mode' : 'Switch to Demo'}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full transition-colors">
            <span className={`w-2 h-2 rounded-full ${status.includes('Connected') || status.includes('Demo') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{status}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
