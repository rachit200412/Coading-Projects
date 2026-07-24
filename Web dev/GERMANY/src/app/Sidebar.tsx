import { GraduationCap, LayoutDashboard, BookOpen, Map, Clock, Plane, FolderKanban, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { View } from './types';

const NAV_ITEMS = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'subjects' as View, label: 'Subjects', icon: BookOpen },
  { id: 'roadmap' as View, label: 'Roadmap', icon: Map },
  { id: 'sessions' as View, label: 'Study Sessions', icon: Clock },
  { id: 'germany' as View, label: 'Germany Prep', icon: Plane },
  { id: 'projects' as View, label: 'Projects', icon: FolderKanban },
  { id: 'analytics' as View, label: 'Analytics', icon: BarChart2 },
];

interface SidebarProps {
  activeView: View;
  setView: (v: View) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export function Sidebar({ activeView, setView, collapsed, setCollapsed }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col bg-sidebar border-r border-sidebar-border h-full transition-all duration-300 ease-in-out ${collapsed ? 'w-[60px]' : 'w-[220px]'} shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 py-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold text-sidebar-foreground truncate">DS Roadmap</p>
            <p className="text-[10px] text-muted-foreground">Germany Journey</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-sidebar-accent-foreground' : ''}`} />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-accent-foreground" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
