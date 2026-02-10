import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SearchCode, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

const Home = ({ onSearch, loading, error }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Trigger search in parent
    await onSearch(query);
    // Navigate to dashboard
    navigate(`/analysis?q=${encodeURIComponent(query)}`);
  };

  const suggestions = [
    "iPhone 15", "Sony WH-1000XM5", "Samsung Galaxy S24",
    "Nike Air Jordan", "Kindle Paperwhite", "Logitech MX Master 3"
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-lg flex items-center justify-center gap-2">
            NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse">AI</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-light">
            Next-Gen Market Intelligence & Sentiment Analysis
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden transition-all group hover:shadow-emerald-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-20 pointer-events-none">
            <Sparkles size={150} className="text-slate-900 dark:text-emerald-500" />
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="flex gap-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Analyze a product..."
                className="flex-1 p-5 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-transparent focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(52,211,153,0.3)] outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-8 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Search size={24} />}
              </button>
            </div>

            {/* Search Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] font-bold mr-2">Trending:</span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    onSearch(s); navigate(`/analysis?q=${encodeURIComponent(s)}`);
                  }}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-slate-600 dark:text-slate-400 font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium opacity-70">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Real-time Data
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span> Deep Learning
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span> Instant Insights
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
