import type { ElementType } from 'react';
import { useStore } from './store';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, Clock, Flame, Award, BarChart2 } from 'lucide-react';

const CAT_LABELS: Record<string, string> = {
  bca: 'BCA', datascience: 'Data Science', mathematics: 'Mathematics',
  language: 'Language', germany: 'Germany', projects: 'Projects', certifications: 'Certifications',
};
const CAT_COLORS: Record<string, string> = {
  bca: '#6366f1', datascience: '#10b981', mathematics: '#f59e0b',
  language: '#06b6d4', germany: '#8b5cf6', projects: '#ef4444', certifications: '#f97316',
};

const TOOLTIP = {
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--foreground)',
  },
  cursor: { fill: 'var(--muted)', opacity: 0.4 },
};

export function AnalyticsPage() {
  const { data, categoryProgress, totalHours, weeklyHours, streak } = useStore();

  // Category progress horizontal bar
  const catData = Object.keys(CAT_LABELS).map(cat => ({
    name: CAT_LABELS[cat],
    progress: categoryProgress(cat),
    color: CAT_COLORS[cat],
  }));

  // Subject completion bar (top 10 by progress)
  const subjectData = [...data.subjects]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10)
    .map(s => ({
      name: s.name.length > 22 ? s.name.slice(0, 20) + '…' : s.name,
      progress: s.progress,
      color: CAT_COLORS[s.category] || '#6366f1',
    }));

  // Weekly hours (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (6 - i));
    const dateStr = dt.toISOString().split('T')[0];
    const hours = data.sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.duration, 0);
    return {
      day: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: +hours.toFixed(2),
    };
  });

  // Monthly hours (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() - (5 - i));
    const monthStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    const hours = data.sessions
      .filter(s => s.date.startsWith(monthStr))
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      month: dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      hours: +hours.toFixed(2),
    };
  });

  // Time per subject pie
  const timeMap: Record<string, number> = {};
  data.sessions.forEach(s => {
    timeMap[s.subjectName] = (timeMap[s.subjectName] || 0) + s.duration;
  });
  const timePieData = Object.entries(timeMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([name, hours], i) => ({
      name: name.length > 18 ? name.slice(0, 16) + '…' : name,
      hours: +hours.toFixed(1),
      color: Object.values(CAT_COLORS)[i % Object.values(CAT_COLORS).length],
    }));

  // Roadmap completion by category
  const roadmapCats = [...new Set(data.roadmapItems.map(r => r.category))];
  const roadmapData = roadmapCats.map(cat => {
    const items = data.roadmapItems.filter(r => r.category === cat);
    return {
      name: cat,
      completed: items.filter(r => r.completed).length,
      remaining: items.filter(r => !r.completed).length,
      pct: items.length > 0 ? Math.round((items.filter(r => r.completed).length / items.length) * 100) : 0,
    };
  });

  const axisStyle = { fontSize: 11, fill: '#64748b' };

  const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: ElementType; color: string }) => (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
    </div>
  );

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights across your learning journey</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Study Hours" value={`${totalHours.toFixed(1)}h`} icon={Clock} color="#6366f1" />
        <StatCard label="Weekly Hours" value={`${weeklyHours.toFixed(1)}h`} icon={TrendingUp} color="#10b981" />
        <StatCard label="Streak" value={`${streak} days`} icon={Flame} color="#ef4444" />
        <StatCard label="Sessions" value={`${data.sessions.length}`} icon={Award} color="#f59e0b" />
      </div>

      {/* Row 1: Category progress + Time per subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category progress - horizontal bars */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Progress by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} width={90} />
              <Tooltip {...TOOLTIP} formatter={(v: number) => [`${v}%`, 'Progress']} />
              <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time per subject pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Time Spent per Subject</h3>
          {timePieData.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <BarChart2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">No sessions logged yet</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={160} height={200}>
                <PieChart>
                  <Pie
                    data={timePieData} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={72} paddingAngle={3} dataKey="hours"
                  >
                    {timePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP} formatter={(v: number) => [`${v}h`, 'Hours']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 min-w-0">
                {timePieData.map(({ name, hours, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-muted-foreground truncate">{name}</span>
                    </div>
                    <span className="font-mono font-bold text-foreground shrink-0">{hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Weekly + Monthly hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Hours — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={weeklyData} barCategoryGap="35%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisStyle} />
              <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
              <Tooltip {...TOOLTIP} formatter={(v: number) => [`${v}h`, 'Hours']} />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Hours — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisStyle} />
              <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
              <Tooltip {...TOOLTIP} formatter={(v: number) => [`${v}h`, 'Hours']} />
              <Line
                type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject completion comparison */}
      {subjectData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Subject Completion (Top 10)</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, subjectData.length * 32)}>
            <BarChart data={subjectData} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={axisStyle} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} width={150} />
              <Tooltip {...TOOLTIP} formatter={(v: number) => [`${v}%`, 'Progress']} />
              <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                {subjectData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Roadmap progress stacked */}
      {roadmapData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Roadmap Topics — Completed vs Remaining</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roadmapData} barCategoryGap="30%">
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} />
              <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
              <Tooltip {...TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" name="Remaining" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Germany prep section progress */}
      {data.germanyItems.length > 0 && (() => {
        const sections = [...new Set(data.germanyItems.map(g => g.section))];
        const germanyChart = sections.map(s => {
          const items = data.germanyItems.filter(g => g.section === s);
          return {
            name: s.replace(' Preparation', '').replace(' Shortlisting', ''),
            progress: Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length),
          };
        });
        return (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Germany Preparation by Section</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={germanyChart} barCategoryGap="35%">
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip {...TOOLTIP} formatter={(v: number) => [`${v}%`, 'Progress']} />
                <Bar dataKey="progress" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}
    </div>
  );
}
