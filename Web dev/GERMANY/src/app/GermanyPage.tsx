import { useState, useMemo } from 'react';
import { useStore } from './store';
import type { GermanyItem } from './types';
import { Modal, FormInput, FormTextarea, FormSelect, Button, ProgressRing } from './ui';
import { Plus, CheckCircle2, Circle, ChevronDown, ChevronRight, Plane, AlertCircle } from 'lucide-react';

const SECTIONS = [
  'IELTS Preparation',
  'SOP Preparation',
  'University Shortlisting',
  'LOR Collection',
  'Projects',
  'Work Experience',
  'Certifications',
];

const SECTION_COLORS: Record<string, string> = {
  'IELTS Preparation': '#6366f1',
  'SOP Preparation': '#10b981',
  'University Shortlisting': '#f59e0b',
  'LOR Collection': '#06b6d4',
  'Projects': '#8b5cf6',
  'Work Experience': '#f97316',
  'Certifications': '#ef4444',
};

const EMPTY: Omit<GermanyItem, 'id'> = {
  section: 'IELTS Preparation', task: '', progress: 0, deadline: '', completed: false, notes: '',
};

function daysLeft(deadline: string): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86400000);
}

export function GermanyPage() {
  const { data, updateGermanyItem, addGermanyItem, deleteGermanyItem } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<GermanyItem, 'id'>>(EMPTY);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    return SECTIONS.map(section => {
      const items = data.germanyItems.filter(g => g.section === section);
      const progress = items.length > 0
        ? Math.round(items.reduce((s, g) => s + g.progress, 0) / items.length)
        : 0;
      return { section, items, progress };
    });
  }, [data.germanyItems]);

  const overallProgress = data.germanyItems.length > 0
    ? Math.round(data.germanyItems.reduce((s, g) => s + g.progress, 0) / data.germanyItems.length)
    : 0;

  const completedCount = data.germanyItems.filter(g => g.completed).length;

  const toggleSection = (s: string) => {
    setCollapsedSections(prev => {
      const n = new Set(prev);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  };

  const handleAdd = () => {
    if (!form.task.trim()) return;
    addGermanyItem(form);
    setForm(EMPTY);
    setModalOpen(false);
  };

  const f = <K extends keyof Omit<GermanyItem, 'id'>>(k: K) => (v: Omit<GermanyItem, 'id'>[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Germany Preparation</h1>
          <p className="text-sm text-muted-foreground">Track your Master's application journey</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Overall progress hero card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-6">
          <ProgressRing progress={overallProgress} size={96} strokeWidth={8} color="#8b5cf6" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground mb-1">Overall Germany Preparation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {completedCount} of {data.germanyItems.length} tasks completed
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {grouped.map(({ section, progress }) => (
                <div key={section} className="flex flex-col items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: SECTION_COLORS[section] || '#6366f1' }}
                  />
                  <span className="text-[10px] font-mono font-bold text-foreground">{progress}%</span>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight hidden sm:block">
                    {section.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section groups */}
      <div className="space-y-3">
        {grouped.map(({ section, items, progress }) => {
          const color = SECTION_COLORS[section] || '#6366f1';
          const isCollapsed = collapsedSections.has(section);
          const upcomingDeadline = items
            .filter(i => !i.completed && i.deadline)
            .map(i => ({ ...i, dl: daysLeft(i.deadline)! }))
            .filter(i => i.dl !== null && i.dl <= 30 && i.dl >= 0)
            .sort((a, b) => a.dl - b.dl)[0];

          return (
            <div key={section} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors"
              >
                <div
                  className="w-1.5 rounded-full shrink-0 self-stretch"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">{section}</h3>
                    {upcomingDeadline && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 rounded text-[10px] text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        {upcomingDeadline.dl}d
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-28 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">{progress}%</span>
                    <span className="text-[11px] text-muted-foreground">
                      · {items.filter(i => i.completed).length}/{items.length}
                    </span>
                  </div>
                </div>
                {isCollapsed
                  ? <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="border-t border-border">
                  {items.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-muted-foreground">No tasks yet. Add one!</p>
                    </div>
                  ) : items.map(item => {
                    const dl = daysLeft(item.deadline);
                    const isOverdue = dl !== null && dl < 0;
                    const isUrgent = dl !== null && dl >= 0 && dl <= 14;
                    const isExpanded = expandedItem === item.id;

                    return (
                      <div key={item.id} className="border-b border-border/50 last:border-0">
                        {/* Row */}
                        <div className="flex items-start gap-3 px-4 py-3">
                          <button
                            onClick={() => updateGermanyItem(item.id, {
                              completed: !item.completed,
                              progress: !item.completed ? 100 : item.progress,
                            })}
                            className="shrink-0 mt-0.5 transition-transform hover:scale-110"
                          >
                            {item.completed
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              : <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-primary transition-colors" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.task}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {item.deadline && (
                                <span className={`text-[11px] font-medium ${
                                  isOverdue
                                    ? 'text-red-500'
                                    : isUrgent
                                    ? 'text-amber-500'
                                    : 'text-muted-foreground'
                                }`}>
                                  {isOverdue ? `Overdue by ${Math.abs(dl!)}d` : dl === 0 ? 'Due today' : dl !== null ? `${dl}d left` : ''} · {item.deadline}
                                </span>
                              )}
                            </div>
                            {/* Progress bar */}
                            {!item.completed && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${item.progress}%`, backgroundColor: color }}
                                  />
                                </div>
                                <span className="text-[11px] font-mono text-muted-foreground shrink-0">{item.progress}%</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                            className="text-[11px] font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded hover:bg-muted transition-colors shrink-0"
                          >
                            {isExpanded ? 'Close' : 'Edit'}
                          </button>
                        </div>

                        {/* Expanded edit */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 bg-muted/20 border-t border-border/50">
                            <div className="pt-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</label>
                                <span className="text-xs font-mono font-bold text-foreground">{item.progress}%</span>
                              </div>
                              <input
                                type="range" min={0} max={100} value={item.progress}
                                onChange={e => updateGermanyItem(item.id, { progress: Number(e.target.value) })}
                                className="w-full accent-primary cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deadline</label>
                              <input
                                type="date" value={item.deadline}
                                onChange={e => updateGermanyItem(item.id, { deadline: e.target.value })}
                                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</label>
                              <textarea
                                value={item.notes}
                                onChange={e => updateGermanyItem(item.id, { notes: e.target.value })}
                                rows={2}
                                placeholder="Any notes or updates..."
                                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                              />
                            </div>
                            <button
                              onClick={() => { deleteGermanyItem(item.id); setExpandedItem(null); }}
                              className="text-xs text-destructive hover:underline"
                            >
                              Delete this task
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No items at all */}
      {data.germanyItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
          <Plane className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No preparation tasks yet.</p>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Germany Prep Task">
        <div className="space-y-4">
          <FormSelect label="Section" value={form.section} onChange={e => f('section')(e.target.value)}>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </FormSelect>
          <FormInput
            label="Task Description"
            value={form.task}
            onChange={e => f('task')(e.target.value)}
            placeholder="e.g. Complete IELTS mock test #4"
            autoFocus
          />
          <FormInput
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={e => f('deadline')(e.target.value)}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Initial Progress</label>
              <span className="text-xs font-mono font-bold text-foreground">{form.progress}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={form.progress}
              onChange={e => f('progress')(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <FormTextarea
            label="Notes (optional)"
            value={form.notes}
            onChange={e => f('notes')(e.target.value)}
            placeholder="Any relevant notes..."
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAdd}>Add Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
