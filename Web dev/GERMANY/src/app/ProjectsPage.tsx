import { useState } from 'react';
import { useStore } from './store';
import type { Project, ProjectStatus } from './types';
import { Modal, FormInput, FormTextarea, FormSelect, Button, Badge, ProgressBar } from './ui';
import { Plus, Github, Edit2, Trash2, FolderKanban, ExternalLink, CheckCircle2 } from 'lucide-react';

const STATUS_BADGE: Record<ProjectStatus, string> = {
  planning: 'default',
  'in-progress': 'yellow',
  completed: 'green',
};
const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  'in-progress': 'In Progress',
  completed: 'Completed',
};
const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: '#64748b',
  'in-progress': '#f59e0b',
  completed: '#10b981',
};

const EMPTY: Omit<Project, 'id'> = {
  name: '', description: '', technologies: [], githubLink: '', progress: 0, status: 'planning',
};

export function ProjectsPage() {
  const { data, addProject, updateProject, deleteProject } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(EMPTY);
  const [techInput, setTechInput] = useState('');

  const openAdd = () => {
    setForm(EMPTY);
    setTechInput('');
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Project) => {
    setForm({ ...p });
    setTechInput(p.technologies.join(', '));
    setEditing(p);
    setModalOpen(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) return;
    const technologies = techInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { ...form, technologies };
    if (editing) updateProject(editing.id, payload);
    else addProject(payload);
    setModalOpen(false);
  };

  const f = <K extends keyof Omit<Project, 'id'>>(k: K) => (v: Omit<Project, 'id'>[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const completed = data.projects.filter(p => p.status === 'completed').length;
  const inProgress = data.projects.filter(p => p.status === 'in-progress').length;
  const avgProgress = data.projects.length > 0
    ? Math.round(data.projects.reduce((s, p) => s + p.progress, 0) / data.projects.length)
    : 0;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">{data.projects.length} projects tracked</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: data.projects.length, color: '#6366f1' },
          { label: 'In Progress', value: inProgress, color: '#f59e0b' },
          { label: 'Completed', value: completed, color: '#10b981' },
          { label: 'Avg. Progress', value: `${avgProgress}%`, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-mono text-foreground" style={{ color }}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      {data.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <FolderKanban className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium text-sm">No projects yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Add your first data science project to start building your portfolio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.projects.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group">
              {/* Progress accent bar */}
              <div className="h-1" style={{ backgroundColor: STATUS_COLORS[p.status] }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      {p.status === 'completed'
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <FolderKanban className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <h3 className="font-bold text-foreground text-sm leading-snug">{p.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed pl-10">
                    {p.description}
                  </p>
                )}

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge color={STATUS_BADGE[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                  {p.technologies.slice(0, 5).map(tech => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-[11px] text-muted-foreground font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {p.technologies.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-[11px] text-muted-foreground">
                      +{p.technologies.length - 5} more
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-bold text-foreground">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} color={STATUS_COLORS[p.status]} />
                </div>

                {/* GitHub link */}
                {p.githubLink && (
                  <a
                    href={p.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group/link"
                  >
                    <Github className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate group-hover/link:underline">
                      {p.githubLink.replace('https://github.com/', '')}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Project' : 'Add Project'}
      >
        <div className="space-y-4">
          <FormInput
            label="Project Name"
            value={form.name}
            onChange={e => f('name')(e.target.value)}
            placeholder="e.g. Movie Recommendation System"
            autoFocus
          />
          <FormTextarea
            label="Description"
            value={form.description}
            onChange={e => f('description')(e.target.value)}
            placeholder="Brief description of the project, its goals and approach..."
          />
          <FormInput
            label="Technologies (comma-separated)"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            placeholder="Python, Pandas, Scikit-learn, Flask, React"
          />
          <FormInput
            label="GitHub Link"
            type="url"
            value={form.githubLink}
            onChange={e => f('githubLink')(e.target.value)}
            placeholder="https://github.com/username/repo"
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</label>
              <span className="text-xs font-mono font-bold text-foreground">{form.progress}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={form.progress}
              onChange={e => f('progress')(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
          <FormSelect
            label="Status"
            value={form.status}
            onChange={e => f('status')(e.target.value as ProjectStatus)}
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </FormSelect>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Update' : 'Add Project'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Project">
        <p className="text-sm text-muted-foreground mb-5">
          Delete this project? All project data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="danger" className="flex-1"
            onClick={() => { if (deleteId) { deleteProject(deleteId); setDeleteId(null); } }}
          >
            Delete Project
          </Button>
        </div>
      </Modal>
    </div>
  );
}
