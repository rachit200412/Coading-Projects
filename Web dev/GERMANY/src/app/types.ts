export type Category =
  | 'bca'
  | 'datascience'
  | 'mathematics'
  | 'language'
  | 'germany'
  | 'projects'
  | 'certifications';

export type SubjectStatus = 'not-started' | 'in-progress' | 'completed';
export type ProjectStatus = 'planning' | 'in-progress' | 'completed';
export type View =
  | 'dashboard'
  | 'subjects'
  | 'roadmap'
  | 'sessions'
  | 'germany'
  | 'projects'
  | 'analytics';

export interface Subject {
  id: string;
  name: string;
  category: Category;
  description: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: SubjectStatus;
  notes: string;
  timeSpent: number;
}

export interface RoadmapItem {
  id: string;
  title: string;
  category: string;
  month?: string;
  completed: boolean;
  notes: string;
  order: number;
}

export interface StudySession {
  id: string;
  date: string;
  subjectName: string;
  duration: number;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubLink: string;
  progress: number;
  status: ProjectStatus;
}

export interface GermanyItem {
  id: string;
  section: string;
  task: string;
  progress: number;
  deadline: string;
  completed: boolean;
  notes: string;
}

export interface AppData {
  subjects: Subject[];
  roadmapItems: RoadmapItem[];
  sessions: StudySession[];
  projects: Project[];
  germanyItems: GermanyItem[];
}
