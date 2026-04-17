import { create } from 'zustand';
import type { LessonType } from '@/types';

type PlayerTab = 'video' | 'written' | 'code' | 'quiz';

interface PlayerState {
  activeLessonId: string | null;
  activeLessonType: LessonType | null;
  activeTab: PlayerTab;
  isSidebarOpen: boolean;
  isAiDrawerOpen: boolean;
  notes: string;
  isLessonCompleteModalOpen: boolean;
  lastXpEarned: number;

  setActiveLesson: (lessonId: string, type: LessonType) => void;
  setActiveTab: (tab: PlayerTab) => void;
  toggleSidebar: () => void;
  openAiDrawer: () => void;
  closeAiDrawer: () => void;
  setNotes: (notes: string) => void;
  openLessonCompleteModal: (xp: number) => void;
  closeLessonCompleteModal: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  activeLessonId: null,
  activeLessonType: null,
  activeTab: 'video',
  isSidebarOpen: true,
  isAiDrawerOpen: false,
  notes: '',
  isLessonCompleteModalOpen: false,
  lastXpEarned: 0,

  setActiveLesson: (lessonId, type) => {
    const tabMap: Record<LessonType, PlayerTab> = {
      video: 'video',
      written: 'written',
      code: 'code',
      quiz: 'quiz',
      prompt_lab: 'code',
      ai_debug: 'code',
      client_brief: 'written',
      capstone: 'written',
    };
    set({ activeLessonId: lessonId, activeLessonType: type, activeTab: tabMap[type] });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openAiDrawer: () => set({ isAiDrawerOpen: true }),
  closeAiDrawer: () => set({ isAiDrawerOpen: false }),
  setNotes: (notes) => set({ notes }),
  openLessonCompleteModal: (xp) =>
    set({ isLessonCompleteModalOpen: true, lastXpEarned: xp }),
  closeLessonCompleteModal: () =>
    set({ isLessonCompleteModalOpen: false }),
}));
