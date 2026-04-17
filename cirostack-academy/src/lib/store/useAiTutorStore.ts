import { create } from 'zustand';
import type { AiTutorMessage, AiModel } from '@/types';
import { apiPost } from '@/lib/api/client';

interface AiTutorState {
  /** Conversation history keyed by lessonId */
  conversations: Record<string, AiTutorMessage[]>;
  isLoading: boolean;
  activeModel: AiModel;
  setActiveModel: (model: AiModel) => void;
  sendMessage: (lessonId: string, content: string) => Promise<void>;
  clearConversation: (lessonId: string) => void;
}

export const useAiTutorStore = create<AiTutorState>((set, get) => ({
  conversations: {},
  isLoading: false,
  activeModel: 'claude',

  setActiveModel: (model) => set({ activeModel: model }),

  sendMessage: async (lessonId, content) => {
    const userMsg: AiTutorMessage = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      conversations: {
        ...state.conversations,
        [lessonId]: [...(state.conversations[lessonId] || []), userMsg],
      },
      isLoading: true,
    }));

    try {
      const res = await apiPost<AiTutorMessage>('/ai-tutor/chat', {
        lessonId,
        message: content,
        model: get().activeModel,
      });

      set((state) => ({
        conversations: {
          ...state.conversations,
          [lessonId]: [
            ...(state.conversations[lessonId] || []),
            res,
          ],
        },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  clearConversation: (lessonId) =>
    set((state) => ({
      conversations: { ...state.conversations, [lessonId]: [] },
    })),
}));
