import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppData, Subject, RoadmapItem, StudySession, Project, GermanyItem } from './types';
import { getDefaultData } from './defaults';

const STORAGE_KEY = 'ds-germany-roadmap-v1';

function avgProgress(items: { progress: number }[]): number {
  if (!items.length) return 0;
  return Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length);
}

function calcStreak(sessions: StudySession[]): number {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = (() => { const dt = new Date(); dt.setDate(dt.getDate()-1); return dt.toISOString().split('T')[0]; })();
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    prev.setDate(prev.getDate() - 1);
    if (dates[i] === prev.toISOString().split('T')[0]) streak++;
    else break;
  }
  return streak;
}

function calcWeeklyHours(sessions: StudySession[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const cutoff = weekAgo.toISOString().split('T')[0];
  return sessions.filter(s => s.date >= cutoff).reduce((sum, s) => sum + s.duration, 0);
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export interface StoreContextType {
  data: AppData;
  overallProgress: number;
  categoryProgress: (cat: string) => number;
  totalHours: number;
  weeklyHours: number;
  streak: number;
  addSubject: (s: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, changes: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  toggleRoadmapItem: (id: string) => void;
  updateRoadmapItem: (id: string, changes: Partial<RoadmapItem>) => void;
  addRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'order'>) => void;
  deleteRoadmapItem: (id: string) => void;
  reorderRoadmapItems: (items: RoadmapItem[]) => void;
  addSession: (s: Omit<StudySession, 'id'>) => void;
  deleteSession: (id: string) => void;
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, changes: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateGermanyItem: (id: string, changes: Partial<GermanyItem>) => void;
  addGermanyItem: (item: Omit<GermanyItem, 'id'>) => void;
  deleteGermanyItem: (id: string) => void;
}

const StoreContext = createContext<StoreContextType>(null!);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultData();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const upd = useCallback((fn: (d: AppData) => AppData) => setData(fn), []);

  const addSubject = useCallback((s: Omit<Subject, 'id'>) =>
    upd(d => ({ ...d, subjects: [...d.subjects, { ...s, id: uid() }] })), [upd]);

  const updateSubject = useCallback((id: string, changes: Partial<Subject>) =>
    upd(d => ({ ...d, subjects: d.subjects.map(s => s.id === id ? { ...s, ...changes } : s) })), [upd]);

  const deleteSubject = useCallback((id: string) =>
    upd(d => ({ ...d, subjects: d.subjects.filter(s => s.id !== id) })), [upd]);

  const toggleRoadmapItem = useCallback((id: string) =>
    upd(d => ({ ...d, roadmapItems: d.roadmapItems.map(r => r.id === id ? { ...r, completed: !r.completed } : r) })), [upd]);

  const updateRoadmapItem = useCallback((id: string, changes: Partial<RoadmapItem>) =>
    upd(d => ({ ...d, roadmapItems: d.roadmapItems.map(r => r.id === id ? { ...r, ...changes } : r) })), [upd]);

  const addRoadmapItem = useCallback((item: Omit<RoadmapItem, 'id' | 'order'>) =>
    upd(d => {
      const maxOrder = d.roadmapItems.reduce((m, r) => Math.max(m, r.order), 0);
      return { ...d, roadmapItems: [...d.roadmapItems, { ...item, id: uid(), order: maxOrder + 1 }] };
    }), [upd]);

  const deleteRoadmapItem = useCallback((id: string) =>
    upd(d => ({ ...d, roadmapItems: d.roadmapItems.filter(r => r.id !== id) })), [upd]);

  const reorderRoadmapItems = useCallback((items: RoadmapItem[]) =>
    upd(d => ({ ...d, roadmapItems: items })), [upd]);

  const addSession = useCallback((s: Omit<StudySession, 'id'>) =>
    upd(d => ({ ...d, sessions: [{ ...s, id: uid() }, ...d.sessions] })), [upd]);

  const deleteSession = useCallback((id: string) =>
    upd(d => ({ ...d, sessions: d.sessions.filter(s => s.id !== id) })), [upd]);

  const addProject = useCallback((p: Omit<Project, 'id'>) =>
    upd(d => ({ ...d, projects: [...d.projects, { ...p, id: uid() }] })), [upd]);

  const updateProject = useCallback((id: string, changes: Partial<Project>) =>
    upd(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...changes } : p) })), [upd]);

  const deleteProject = useCallback((id: string) =>
    upd(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) })), [upd]);

  const updateGermanyItem = useCallback((id: string, changes: Partial<GermanyItem>) =>
    upd(d => ({ ...d, germanyItems: d.germanyItems.map(g => g.id === id ? { ...g, ...changes } : g) })), [upd]);

  const addGermanyItem = useCallback((item: Omit<GermanyItem, 'id'>) =>
    upd(d => ({ ...d, germanyItems: [...d.germanyItems, { ...item, id: uid() }] })), [upd]);

  const deleteGermanyItem = useCallback((id: string) =>
    upd(d => ({ ...d, germanyItems: d.germanyItems.filter(g => g.id !== id) })), [upd]);

  const overallProgress = avgProgress(data.subjects);

  const categoryProgress = useCallback((cat: string) => {
    if (cat === 'germany') return avgProgress(data.germanyItems);
    return avgProgress(data.subjects.filter(s => s.category === cat));
  }, [data.subjects, data.germanyItems]);

  const totalHours = data.sessions.reduce((s, sess) => s + sess.duration, 0);
  const weeklyHours = calcWeeklyHours(data.sessions);
  const streak = calcStreak(data.sessions);

  const value: StoreContextType = {
    data, overallProgress, categoryProgress, totalHours, weeklyHours, streak,
    addSubject, updateSubject, deleteSubject,
    toggleRoadmapItem, updateRoadmapItem, addRoadmapItem, deleteRoadmapItem, reorderRoadmapItems,
    addSession, deleteSession,
    addProject, updateProject, deleteProject,
    updateGermanyItem, addGermanyItem, deleteGermanyItem,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
