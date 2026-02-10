import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  MessageSquare, ArrowUpRight, Database, ArrowLeft,
  Activity, Star, ThumbsUp, ThumbsDown
} from 'lucide-react';

const Dashboard = ({ data, loading }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  // COLORS (Green/Red/Amber) - Work well on both backgrounds
  const COLORS = {
    Positive: '#10b981', // Emerald-500
    Neutral: '#f59e0b',  // Amber-500
    Negative: '#ef4444'  // Red-500
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = data.length;
    if (total === 0) return { avgRating: 0, positive: 0, negative: 0 };

    const sumScore = data.reduce((acc, item) => acc + parseFloat(item.score), 0);
    const avgScore = total ? (sumScore / total) : 0;
    const avgRating = ((avgScore + 1) * 2.5).toFixed(1);

    const posCount = data.filter(d => d.sentiment === 'Positive').length;
    const negCount = data.filter(d => d.sentiment === 'Negative').length;

    return {
      avgRating,
      positive: Math.round((posCount / total) * 100),
      negative: Math.round((negCount / total) * 100)
    };
  }, [data]);

  const sentimentStats = useMemo(() => {
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    data.forEach(item => {
      if (counts[item.sentiment] !== undefined) counts[item.sentiment]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  const trendData = useMemo(() => {
    if (!data.length) return [];
    const chunks = 10;
    const chunkSize = Math.ceil(data.length / chunks);
    const trends = [];

    for (let i = 0; i < chunks; i++) {
      const slice = data.slice(0, (i + 1) * chunkSize);
      const pos = slice.filter(d => d.sentiment === 'Positive').length;
      const neg = slice.filter(d => d.sentiment === 'Negative').length;
      const neu = slice.filter(d => d.sentiment === 'Neutral').length;
      trends.push({
        name: `T${i + 1}`,
        Positive: pos,
        Negative: neg,
        Neutral: neu
      });
    }
    return trends;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse font-medium text-emerald-600 dark:text-emerald-400">Processing Nexus Data...</p>
      </div>
    );
  }

  if (!query) return null;

  if (!data.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-6">
        <Database size={64} className="opacity-20 text-emerald-500" />
        <div className="text-center">
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300">No Nexus Data Found</p>
          <p className="text-sm">Search for a product to see insights.</p>
        </div>
        <Link to="/" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          New Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-2 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link to="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white">
          <ArrowLeft />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{query}</h2>
          <p className="text-slate-500 dark:text-slate-500 text-xs uppercase tracking-wider font-bold">Nexus Intelligence Report</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', icon: MessageSquare, value: data.length, trend: '+12% from last week', trendColor: 'text-emerald-600 dark:text-emerald-500', barColor: 'from-blue-500' },
          { label: 'Avg Rating', icon: Star, value: metrics.avgRating, trend: '+0.2 improvement', trendColor: 'text-emerald-600 dark:text-emerald-500', barColor: 'from-amber-500' },
          { label: 'Positive', icon: ThumbsUp, value: `${metrics.positive}%`, trend: '+3% vs benchmark', trendColor: 'text-emerald-600 dark:text-emerald-500', barColor: 'from-emerald-500' },
          { label: 'Negative', icon: ThumbsDown, value: `${metrics.negative}%`, trend: '-2% reduction', trendColor: 'text-red-600 dark:text-red-500', barColor: 'from-red-500' }
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{card.label}</span>
              <card.icon size={18} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">{card.value}</div>
            <div className={`${card.trendColor} text-xs font-bold mt-2 flex items-center gap-1`}>
              <span>{card.trend.split(' ')[0]}</span> <span className="text-slate-400 dark:text-slate-500 font-normal">{card.trend.split(' ').slice(1).join(' ')}</span>
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${card.barColor} to-transparent opacity-50`}></div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Distribution Pie (Donut) */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-1 min-h-[350px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Sentiment Distribution</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentStats}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentStats.map((e, i) => <Cell key={i} fill={COLORS[e.name]} cornerRadius={4} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-600 dark:text-slate-400 ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">{metrics.positive}%</span>
                <p className="text-xs text-slate-500 uppercase">Positive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Volume Trend (Area Chart) */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Sentiment Trends Over Time</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.Positive} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.Positive} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.Neutral} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.Neutral} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.Negative} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.Negative} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff' }}
                />
                <Area type="monotone" dataKey="Positive" stroke={COLORS.Positive} fillOpacity={1} fill="url(#colorPos)" strokeWidth={2} />
                <Area type="monotone" dataKey="Neutral" stroke={COLORS.Neutral} fillOpacity={1} fill="url(#colorNeu)" strokeWidth={2} />
                <Area type="monotone" dataKey="Negative" stroke={COLORS.Negative} fillOpacity={1} fill="url(#colorNeg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Reviews</h3>
        </div>

        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col md:flex-row gap-4 items-start shadow-sm hover:shadow-md">

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${item.sentiment === 'Positive' ? 'bg-emerald-500' :
                      item.sentiment === 'Negative' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{item.product}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-500">• {item.source}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">"{item.review}"</p>
              </div>

              <div className="flex items-center gap-4 min-w-[120px] justify-end">
                <div className="text-right">
                  <div className={`font-bold text-sm ${item.sentiment === 'Positive' ? 'text-emerald-600 dark:text-emerald-500' :
                      item.sentiment === 'Negative' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'
                    }`}>
                    {item.sentiment}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-600 font-mono">{item.score} Score</div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
