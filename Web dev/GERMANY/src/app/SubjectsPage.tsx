import { useState, useMemo } from 'react';
import { useStore } from './store';
import type { Subject, Category, SubjectStatus } from './types';
import { Modal, FormInput, FormTextarea, FormSelect, Badge, ProgressBar, Button, SliderInput } from './ui';
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';

const CAT_COLORS: Record<Category, string> = {
  bca: 'blue', datascience: 'green', mathematics: 'yellow',
  language: 'cyan', germany: 'purple', projects: 'red', certifications: 'orange',
};
const CAT_LABELS: Record<Category, string> = {
  bca: 'BCA', datascience: 'Data Science', mathematics: 'Mathematics',
  language: 'Language', germany: 'Germany', projects: 'Projects', certifications: 'Certifications',
};
const STATUS_LABELS: Record<SubjectStatus, string> = {
  'not-started': 'Not Started', 'in-progress': 'In Progress', 'completed': 'Completed',
};
const STATUS_BADGE: Record<SubjectStatus, string> = {
  'not-started': 'default', 'in-progress': 'yellow', 'completed': 'green',
};
const CAT_ACCENT: Record<Category, string> = {
  bca: '#6366f1', datascience: '#10b981', mathematics: '#f59e0b',
  language: '#06b6d4', germany: '#8b5cf6', projects: '#ef4444', certifications: '#f97316',
};

const EMPTY: Omit<Subject, 'id'> = {
  name: '', category: 'bca', description: '', startDate: '', targetDate: '',
  progress: 0, status: 'not-started', notes: '', timeSpent: 0,
};

export function SubjectsPage() {
  const { data, addSubject, updateSubject, deleteSubject } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'target'>('name');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState<Omit<Subject, 'id'>>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = data.subjects.filter(s => {
      const matchCat = catFilter === 'all' || s.category === catFilter;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'target') return a.targetDate.localeCompare(b.targetDate);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [data.subjects, catFilter, search, sortBy]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModalOpen(true); };
  const openEdit = (s: Subject) => { setForm({ ...s }); setEditing(s); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) updateSubject(editing.id, form);
    else addSubject(form);
    setModalOpen(false);
  };

  const f = <K extends keyof Omit<Subject, 'id'>>(k: K) => (v: Omit<Subject, 'id'>[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const completedCount = data.subjects.filter(s => s.status === 'completed').length;
  const inProgressCount = data.subjects.filter(s => s.status === 'in-progress').length;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            {data.subjects.length} total · {inProgressCount} in progress · {completedCount} completed
          </p>
        </div>
        <Button onClick={openAdd} size="md">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value as Category | 'all')}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Categories</option>
          {(Object.keys(CAT_LABELS) as Category[]).map(cat => (
            <option key={cat} value={cat}>{CAT_LABELS[cat]}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'progress' | 'target')}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="name">Sort: Name</option>
          <option value="progress">Sort: Progress ↓</option>
          <option value="target">Sort: Deadline</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No subjects found.</p>
          {search && <p className="text-muted-foreground/70 text-xs mt-1">Try clearing the search filter.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all group relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                style={{ backgroundColor: CAT_ACCENT[s.category] }}
              />
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground text-sm leading-tight">{s.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {s.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{s.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge color={CAT_COLORS[s.category]}>{CAT_LABELS[s.category]}</Badge>
                <Badge color={STATUS_BADGE[s.status]}>{STATUS_LABELS[s.status]}</Badge>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-bold text-foreground">{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} color={CAT_ACCENT[s.category]} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Due: {s.targetDate || '—'}</span>
                <span className="font-mono">{s.timeSpent}h studied</span>
              </div>

              {s.notes && (
                <p className="mt-2 text-[11px] text-muted-foreground border-t border-border pt-2 line-clamp-1 italic">
                  {s.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <div className="space-y-4">
          <FormInput label="Subject Name" value={form.name} onChange={e => f('name')(e.target.value)} placeholder="e.g. Machine Learning" />
          <FormSelect label="Category" value={form.category} onChange={e => f('category')(e.target.value as Category)}>
            {(Object.keys(CAT_LABELS) as Category[]).map(cat => (
              <option key={cat} value={cat}>{CAT_LABELS[cat]}</option>
            ))}
          </FormSelect>
          <FormTextarea label="Description" value={form.description} onChange={e => f('description')(e.target.value)} placeholder="Brief description..." />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start Date" type="date" value={form.startDate} onChange={e => f('startDate')(e.target.value)} />
            <FormInput label="Target Date" type="date" value={form.targetDate} onChange={e => f('targetDate')(e.target.value)} />
          </div>
          <SliderInput label="Progress" value={form.progress} onChange={f('progress')} />
          <FormSelect label="Status" value={form.status} onChange={e => f('status')(e.target.value as SubjectStatus)}>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </FormSelect>
          <FormInput
            label="Time Spent (hours)"
            type="number" min={0} step={0.5}
            value={form.timeSpent}
            onChange={e => f('timeSpent')(Number(e.target.value))}
          />
          <FormTextarea label="Notes" value={form.notes} onChange={e => f('notes')(e.target.value)} placeholder="Additional notes..." />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Update' : 'Add Subject'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Subject">
        <p className="text-sm text-muted-foreground mb-5">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { if (deleteId) { deleteSubject(deleteId); setDeleteId(null); } }}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
