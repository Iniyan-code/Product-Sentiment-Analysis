import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  PieChart as PieIcon, TrendingUp, MessageSquare, ArrowUpRight,
  Database, ArrowLeft
} from 'lucide-react';

const Dashboard = ({ data, loading }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const COLORS = {
    Positive: '#10b981',
    Neutral: '#64748b',
    Negative: '#ef4444'
  };

  const sentimentStats = useMemo(() => {
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    data.forEach(item => {
      if (counts[item.sentiment] !== undefined) counts[item.sentiment]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  const chartData = useMemo(() => data.slice(0, 15).map(d => ({
    name: d.product.substring(0, 10),
    score: parseFloat(d.score),
    full: d.product
  })), [data]);

  if (!query) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <p>Please enter a product name to search.</p>
        <Link to="/" className="text-blue-600 hover:underline">Go Home</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Analyzing reviews for "{query}"...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-6">
        <Database size={64} className="opacity-20" />
        <div className="text-center">
          <p className="text-xl font-bold text-slate-600 dark:text-slate-300">No results found for "{query}"</p>
          <p className="text-sm">Try searching for a different product.</p>
        </div>
        <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="text-slate-600 dark:text-slate-300" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis Results</h2>
          <p className="text-slate-500 dark:text-slate-400">Showing insights for <span className="font-bold text-blue-600 dark:text-blue-400">"{query}"</span></p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Distribution Pie */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 lg:col-span-1 min-h-[350px] flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <PieIcon size={14} /> Sentiment Distribution
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentStats}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentStats.map((e, i) => <Cell key={i} fill={COLORS[e.name]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Improved Bar Chart */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 lg:col-span-2 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <TrendingUp size={14} /> Sentiment Variance (Recent)
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis domain={[-1, 1]} fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reviews Feed (Cards) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" /> Recent Reviews
          </h3>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold px-3 py-1 rounded-full">
            {data.length} Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all group flex flex-col gap-4">

              {/* Card Header */}
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${item.source === 'Amazon' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-800' :
                  item.source === 'Flipkart' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                    'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                  {item.source || 'Unknown'}
                </span>
                <div className={`w-2 h-2 rounded-full ${item.sentiment === 'Positive' ? 'bg-emerald-500' : item.sentiment === 'Negative' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
              </div>

              {/* Product & Score */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1 mb-1" title={item.product}>
                  {item.product}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${parseFloat(item.score) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(parseFloat(item.score)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{item.score}</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex-1">
                <p className="text-slate-600 dark:text-slate-300 text-sm italic line-clamp-4">
                  "{item.review}"
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <span className={`text-xs font-bold ${item.sentiment === 'Positive' ? 'text-emerald-600' : item.sentiment === 'Negative' ? 'text-red-500' : 'text-slate-500'}`}>
                  {item.sentiment}
                </span>
                <button className="text-slate-300 hover:text-blue-500 transition-colors">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
