import { useState, useMemo, type DragEvent } from 'react';
import { useStore } from './store';
import type { RoadmapItem } from './types';
import { Modal, FormInput, FormSelect, Button } from './ui';
import { Plus, CheckCircle2, Circle, Trash2, GripVertical, ChevronDown, ChevronRight, Map } from 'lucide-react';

const ROADMAP_CATEGORIES = ['BCA Subjects', 'Data Science', 'Mathematics', 'Custom'];
const MONTHS = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'];

const CAT_COLORS: Record<string, string> = {
  'BCA Subjects': '#6366f1',
  'Data Science': '#10b981',
  'Mathematics': '#f59e0b',
  'Custom': '#8b5cf6',
};
const CAT_BG: Record<string, string> = {
  'BCA Subjects': 'bg-indigo-50 dark:bg-indigo-950/20',
  'Data Science': 'bg-emerald-50 dark:bg-emerald-950/20',
  'Mathematics': 'bg-amber-50 dark:bg-amber-950/20',
  'Custom': 'bg-violet-50 dark:bg-violet-950/20',
};

export function RoadmapPage() {
  const { data, toggleRoadmapItem, addRoadmapItem, deleteRoadmapItem, reorderRoadmapItems } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ title: '', category: 'BCA Subjects', month: '' });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Group items by category, then optionally by month
  const grouped = useMemo(() => {
    const catOrder = ['BCA Subjects', 'Data Science', 'Mathematics', 'Custom'];
    const cats = [...new Set(data.roadmapItems.map(r => r.category))];
    cats.sort((a, b) => {
      const ai = catOrder.indexOf(a);
      const bi = catOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return cats.map(cat => {
      const items = data.roadmapItems
        .filter(r => r.category === cat)
        .sort((a, b) => a.order - b.order);
      const months = [...new Set(items.map(r => r.month).filter(Boolean) as string[])];
      months.sort();
      return { cat, items, months };
    });
  }, [data.roadmapItems]);

  const totalCompleted = data.roadmapItems.filter(r => r.completed).length;
  const totalItems = data.roadmapItems.length;
  const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const toggleCollapse = (key: string) => {
    setCollapsed(s => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addRoadmapItem({
      title: form.title,
      category: form.category,
      month: form.month || undefined,
      completed: false,
      notes: '',
    });
    setForm({ title: '', category: 'BCA Subjects', month: '' });
    setModalOpen(false);
  };

  const handleDragStart = (e: DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };
  const handleDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const items = [...data.roadmapItems];
    const fromIdx = items.findIndex(r => r.id === dragId);
    const toIdx = items.findIndex(r => r.id === targetId);
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    reorderRoadmapItems(items.map((r, i) => ({ ...r, order: i + 1 })));
    setDragId(null);
    setDragOverId(null);
  };
  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Roadmap</h1>
          <p className="text-sm text-muted-foreground">
            {totalCompleted}/{totalItems} topics completed
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Topic
        </Button>
      </div>

      {/* Overall progress bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-foreground">Overall Roadmap Completion</span>
          <span className="font-mono font-bold text-primary">{overallPct}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3">
          {grouped.map(({ cat, items }) => {
            const pct = items.length > 0 ? Math.round((items.filter(r => r.completed).length / items.length) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[cat] || '#6366f1' }} />
                <span className="text-xs text-muted-foreground">{cat.split(' ')[0]}</span>
                <span className="text-xs font-mono font-semibold text-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category groups */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Map className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No roadmap items yet. Add your first topic!</p>
        </div>
      ) : (
        grouped.map(({ cat, items, months }) => {
          const completedCount = items.filter(r => r.completed).length;
          const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
          const color = CAT_COLORS[cat] || '#6366f1';
          const isCollapsed = collapsed.has(cat);

          return (
            <div key={cat} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleCollapse(cat)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${CAT_BG[cat] || 'bg-muted'} flex items-center justify-center`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground text-sm">{cat}</h3>
                    <p className="text-xs text-muted-foreground">{completedCount}/{items.length} completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground w-8 text-right">{pct}%</span>
                  </div>
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="border-t border-border">
                  {months.length > 0 ? (
                    months.map(month => (
                      <div key={month}>
                        <div className="px-4 py-2 bg-muted/30 flex items-center gap-2">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{month}</span>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {items.filter(r => r.month === month && r.completed).length}/{items.filter(r => r.month === month).length}
                          </span>
                        </div>
                        {items.filter(r => r.month === month).map(item => (
                          <RoadmapRow
                            key={item.id}
                            item={item}
                            color={color}
                            isDragOver={dragOverId === item.id}
                            isDragging={dragId === item.id}
                            onToggle={() => toggleRoadmapItem(item.id)}
                            onDelete={() => deleteRoadmapItem(item.id)}
                            onDragStart={e => handleDragStart(e, item.id)}
                            onDragOver={e => handleDragOver(e, item.id)}
                            onDrop={e => handleDrop(e, item.id)}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </div>
                    ))
                  ) : (
                    items.map(item => (
                      <RoadmapRow
                        key={item.id}
                        item={item}
                        color={color}
                        isDragOver={dragOverId === item.id}
                        isDragging={dragId === item.id}
                        onToggle={() => toggleRoadmapItem(item.id)}
                        onDelete={() => deleteRoadmapItem(item.id)}
                        onDragStart={e => handleDragStart(e, item.id)}
                        onDragOver={e => handleDragOver(e, item.id)}
                        onDrop={e => handleDrop(e, item.id)}
                        onDragEnd={handleDragEnd}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add Topic Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Roadmap Topic">
        <div className="space-y-4">
          <FormInput
            label="Topic Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Linear Regression"
            autoFocus
          />
          <FormSelect
            label="Category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {ROADMAP_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </FormSelect>
          <FormSelect
            label="Month (optional)"
            value={form.month}
            onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
          >
            <option value="">No month grouping</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </FormSelect>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAdd}>Add Topic</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RoadmapRow({
  item, color, isDragOver, isDragging,
  onToggle, onDelete, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  item: RoadmapItem;
  color: string;
  isDragOver: boolean;
  isDragging: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 px-4 py-3 group border-b border-border/50 last:border-0 transition-all ${
        isDragOver ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'
      } ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
      <button onClick={onToggle} className="shrink-0 transition-transform hover:scale-110">
        {item.completed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-primary transition-colors" />}
      </button>
      <span
        className={`flex-1 text-sm transition-colors ${
          item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
        }`}
      >
        {item.title}
      </span>
      {item.completed && (
        <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full shrink-0">
          Done
        </span>
      )}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
