import React from 'react';
import { BarChart2, Sun, Moon, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ darkMode, setDarkMode, isDemoMode, setIsDemoMode, status }) => {
  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-3 shadow-sm dark:shadow-slate-900/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-900 dark:text-white group">
          <div className="bg-gradient-to-tr from-emerald-500 to-cyan-600 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span>NEXUS <span className="text-emerald-600 dark:text-emerald-400">AI</span></span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-all border ${isDemoMode
                ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-emerald-400'
              }`}
          >
            {isDemoMode ? 'Demo Mode' : 'Switch to Demo'}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full transition-colors">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${status.includes('Connected') || status.includes('Demo') ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-red-500 shadow-red-500/50'}`}></span>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{status}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
