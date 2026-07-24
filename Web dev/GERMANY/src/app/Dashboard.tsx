import { useStore } from './store';
import { ProgressRing } from './ui';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Flame, Star, BookOpen, Globe, Calculator, Award, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const CAT_COLORS: Record<string, string> = {
  bca: '#6366f1', datascience: '#10b981', mathematics: '#f59e0b',
  language: '#06b6d4', germany: '#8b5cf6', projects: '#ef4444', certifications: '#f97316',
};
const CAT_LABELS: Record<string, string> = {
  bca: 'BCA', datascience: 'Data Science', mathematics: 'Mathematics',
  language: 'Language', germany: 'Germany', projects: 'Projects', certifications: 'Certifications',
};

export function Dashboard() {
  const { data, overallProgress, categoryProgress, totalHours, weeklyHours, streak } = useStore();

  const stats = [
    { label: 'Overall Progress', value: `${overallProgress}%`, icon: TrendingUp, color: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Data Science', value: `${categoryProgress('datascience')}%`, icon: BookOpen, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'BCA Subjects', value: `${categoryProgress('bca')}%`, icon: Star, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Mathematics', value: `${categoryProgress('mathematics')}%`, icon: Calculator, color: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    { label: 'Germany Prep', value: `${categoryProgress('germany')}%`, icon: Globe, color: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Weekly Hours', value: `${weeklyHours.toFixed(1)}h`, icon: Clock, color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { label: 'Study Streak', value: `${streak} days`, icon: Flame, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, icon: Award, color: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  ];

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (6 - i));
    const dateStr = dt.toISOString().split('T')[0];
    const hours = data.sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.duration, 0);
    return { day: dt.toLocaleDateString('en-US', { weekday: 'short' }), hours: +hours.toFixed(1) };
  });

  const categories = ['bca', 'datascience', 'mathematics', 'language', 'germany', 'certifications'];
  const pieData = categories
    .map(cat => ({ name: CAT_LABELS[cat], value: categoryProgress(cat), color: CAT_COLORS[cat] }))
    .filter(d => d.value > 0);

  const recentSessions = data.sessions.slice(0, 5);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const summary = [
      ['Germany Data Science Roadmap Tracker'],
      ['Export Date', new Date().toLocaleDateString()],
      [''],
      ['Metric', 'Value'],
      ['Overall Progress', `${overallProgress}%`],
      ['Total Study Hours', totalHours.toFixed(1)],
      ['Current Streak', `${streak} days`],
      ['Weekly Hours', weeklyHours.toFixed(1)],
      ['Total Subjects', data.subjects.length],
      ['Sessions Logged', data.sessions.length],
      ['Projects', data.projects.length],
      ['Germany Tasks', data.germanyItems.length],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Dashboard');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.subjects.map(s => ({
      'Subject Name': s.name, Category: s.category, 'Progress (%)': s.progress,
      Status: s.status, 'Start Date': s.startDate, 'Target Date': s.targetDate,
      'Time Spent (hrs)': s.timeSpent, Notes: s.notes,
    }))), 'Subjects');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.roadmapItems.map(r => ({
      Topic: r.title, Category: r.category, Month: r.month || '—',
      Completed: r.completed ? 'Yes' : 'No', Notes: r.notes,
    }))), 'Roadmap');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.sessions.map(s => ({
      Date: s.date, Subject: s.subjectName, 'Duration (hrs)': s.duration, Notes: s.notes,
    }))), 'Study Sessions');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.germanyItems.map(g => ({
      Section: g.section, Task: g.task, 'Progress (%)': g.progress,
      Deadline: g.deadline, Completed: g.completed ? 'Yes' : 'No', Notes: g.notes,
    }))), 'Germany Prep');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.projects.map(p => ({
      Name: p.name, Description: p.description, Technologies: p.technologies.join(', '),
      GitHub: p.githubLink, 'Progress (%)': p.progress, Status: p.status,
    }))), 'Projects');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      categories.map(cat => ({ Category: CAT_LABELS[cat], 'Progress (%)': categoryProgress(cat) }))
    ), 'Analytics');

    XLSX.writeFile(wb, `ds-roadmap-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tooltipStyle = {
    contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' },
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Data Science & Germany preparation overview</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-bold text-foreground font-mono">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Study Hours — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={weeklyData} barCategoryGap="35%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}h`, 'Hours']} />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Progress by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Progress']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 min-w-0">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-muted-foreground truncate">{name}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Rings + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Progress Rings</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categories.map(cat => (
              <div key={cat} className="flex flex-col items-center gap-2">
                <ProgressRing progress={categoryProgress(cat)} size={68} strokeWidth={6} color={CAT_COLORS[cat]} />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{CAT_LABELS[cat]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No sessions yet. Start studying!</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map(s => (
                <div key={s.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{s.subjectName}</p>
                    <p className="text-[10px] text-muted-foreground">{s.date} · {s.duration}h</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Roadmap completion summary */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Roadmap Completion</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {data.roadmapItems.filter(r => r.completed).length} of {data.roadmapItems.length} topics completed
              </span>
              <span className="font-mono font-bold text-foreground">
                {data.roadmapItems.length > 0
                  ? Math.round((data.roadmapItems.filter(r => r.completed).length / data.roadmapItems.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${data.roadmapItems.length > 0 ? (data.roadmapItems.filter(r => r.completed).length / data.roadmapItems.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
