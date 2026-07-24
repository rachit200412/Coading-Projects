import { useState, useMemo } from 'react';
import { useStore } from './store';
import { FormInput, FormTextarea, Button, Modal } from './ui';
import { Plus, Trash2, Clock, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function SessionsPage() {
  const { data, addSession, deleteSession, totalHours, weeklyHours } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subjectName: '',
    duration: '',
    notes: '',
  });

  const handleAdd = () => {
    if (!form.subjectName.trim() || !form.duration) return;
    addSession({
      date: form.date,
      subjectName: form.subjectName,
      duration: Number(form.duration),
      notes: form.notes,
    });
    setForm({
      date: new Date().toISOString().split('T')[0],
      subjectName: '',
      duration: '',
      notes: '',
    });
    setShowForm(false);
  };

  // Group sessions by date, newest first
  const grouped = useMemo(() => {
    const map: Record<string, typeof data.sessions> = {};
    data.sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [data.sessions]);

  // Last 7 days chart
  const weeklyChart = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (6 - i));
    const dateStr = dt.toISOString().split('T')[0];
    const hours = data.sessions
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      day: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: +hours.toFixed(1),
      isToday: i === 6,
    };
  });

  // Subject names for autocomplete
  const subjectNames = useMemo(
    () => [...new Set(data.subjects.map(s => s.name))].sort(),
    [data.subjects]
  );

  const today = new Date().toISOString().split('T')[0];
  const todayHours = data.sessions.filter(s => s.date === today).reduce((sum, s) => sum + s.duration, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  const monthHours = data.sessions.filter(s => s.date >= monthStartStr).reduce((sum, s) => sum + s.duration, 0);

  const tooltipStyle = {
    contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' },
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Study Sessions</h1>
          <p className="text-sm text-muted-foreground">{data.sessions.length} sessions logged</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Log Session
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Today', value: `${todayHours.toFixed(1)}h`, icon: Clock, color: '#6366f1' },
          { label: 'This Week', value: `${weeklyHours.toFixed(1)}h`, icon: TrendingUp, color: '#10b981' },
          { label: 'This Month', value: `${monthHours.toFixed(1)}h`, icon: Calendar, color: '#f59e0b' },
          { label: 'All Time', value: `${totalHours.toFixed(1)}h`, icon: BookOpen, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Study Hours — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyChart} barCategoryGap="35%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}h`, 'Hours']} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {weeklyChart.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? '#6366f1' : '#6366f180'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Session list */}
      <div className="space-y-4">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
            <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">No sessions yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Log your first study session to start tracking</p>
          </div>
        ) : grouped.map(([date, sessions]) => {
          const dateLabel = (() => {
            const dt = new Date(date + 'T12:00:00');
            const t = new Date();
            const y = new Date(); y.setDate(y.getDate() - 1);
            if (date === t.toISOString().split('T')[0]) return 'Today';
            if (date === y.toISOString().split('T')[0]) return 'Yesterday';
            return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
          })();
          const dayTotal = sessions.reduce((s, sess) => s + sess.duration, 0);

          return (
            <div key={date} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{dateLabel}</span>
                  <span className="text-xs text-muted-foreground">· {date}</span>
                </div>
                <span className="text-xs font-mono font-bold text-foreground">{dayTotal.toFixed(1)}h total</span>
              </div>
              {sessions.map(sess => (
                <div
                  key={sess.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 group hover:bg-muted/20 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{sess.subjectName}</p>
                    {sess.notes && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{sess.notes}</p>
                    )}
                  </div>
                  <span className="text-sm font-mono font-bold text-foreground shrink-0 px-2.5 py-1 bg-muted rounded-lg">
                    {sess.duration}h
                  </span>
                  <button
                    onClick={() => setDeleteId(sess.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Log Session Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Log Study Session">
        <div className="space-y-4">
          <FormInput
            label="Date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</label>
            <input
              list="subject-options"
              value={form.subjectName}
              onChange={e => setForm(f => ({ ...f, subjectName: e.target.value }))}
              placeholder="Select or type subject name"
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <datalist id="subject-options">
              {subjectNames.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
          <FormInput
            label="Duration (hours)"
            type="number"
            min={0.25}
            max={24}
            step={0.25}
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="e.g. 2.5"
          />
          <FormTextarea
            label="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="What did you study? Topics covered, insights..."
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAdd}>Log Session</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Session">
        <p className="text-sm text-muted-foreground mb-5">Remove this study session? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="danger" className="flex-1"
            onClick={() => { if (deleteId) { deleteSession(deleteId); setDeleteId(null); } }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
