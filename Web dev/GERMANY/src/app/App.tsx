import { useState, useEffect } from 'react';
import { StoreProvider } from './store';
import type { View } from './types';
import { Login } from './Login';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { SubjectsPage } from './SubjectsPage';
import { RoadmapPage } from './RoadmapPage';
import { SessionsPage } from './SessionsPage';
import { GermanyPage } from './GermanyPage';
import { ProjectsPage } from './ProjectsPage';
import { AnalyticsPage } from './AnalyticsPage';
import { Sun, Moon, Menu, LogOut, GraduationCap } from 'lucide-react';

const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Dashboard',
  subjects: 'Subjects',
  roadmap: 'Roadmap',
  sessions: 'Study Sessions',
  germany: 'Germany Preparation',
  projects: 'Projects',
  analytics: 'Analytics',
};

function PageContent({ view }: { view: View }) {
  switch (view) {
    case 'dashboard':  return <Dashboard />;
    case 'subjects':   return <SubjectsPage />;
    case 'roadmap':    return <RoadmapPage />;
    case 'sessions':   return <SessionsPage />;
    case 'germany':    return <GermanyPage />;
    case 'projects':   return <ProjectsPage />;
    case 'analytics':  return <AnalyticsPage />;
  }
}

function MainApp({ onLogout, darkMode, toggleDark }: {
  onLogout: () => void;
  darkMode: boolean;
  toggleDark: () => void;
}) {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on view change
  const handleSetView = (v: View) => {
    setView(v);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 z-50">
            <Sidebar
              activeView={view}
              setView={handleSetView}
              collapsed={false}
              setCollapsed={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          activeView={view}
          setView={setView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 h-14 bg-card border-b border-border shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">DS Roadmap</span>
          </div>

          <h2 className="hidden lg:block font-semibold text-foreground text-sm">
            {VIEW_LABELS[view]}
          </h2>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
              student
            </div>
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <PageContent view={view} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuth, setIsAuth] = useState(() =>
    localStorage.getItem('auth-token') === 'authenticated'
  );
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    setIsAuth(false);
  };

  const toggleDark = () => setDarkMode(d => !d);

  if (!isAuth) {
    return (
      <>
        {/* Dark mode toggle on login screen */}
        <button
          onClick={toggleDark}
          className="fixed top-4 right-4 z-50 p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <Login onLogin={() => setIsAuth(true)} />
      </>
    );
  }

  return (
    <StoreProvider>
      <MainApp onLogout={handleLogout} darkMode={darkMode} toggleDark={toggleDark} />
    </StoreProvider>
  );
}
