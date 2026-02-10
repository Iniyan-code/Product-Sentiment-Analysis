import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SearchCode, RefreshCw, AlertCircle } from 'lucide-react';

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

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Analyze Product <span className="text-blue-600 dark:text-blue-400">Sentiment</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Get instant insights from Amazon and Flipkart reviews using AI-powered sentiment analysis.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-all text-left">
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
            <SearchCode size={150} className="dark:text-white" />
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Enter Product Name
            </label>
            <div className="flex gap-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 'iPhone 15', 'Sony WH-1000XM5'"
                className="flex-1 p-4 text-lg border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Search size={24} />}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Real-time Scraping
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Multi-source Data
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span> AI Sentiment Logic
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
