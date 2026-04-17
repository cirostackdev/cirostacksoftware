import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  /** Call after successful login / signup */
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      token: null,

      login: (user, token) => {
        set({ isLoggedIn: true, user, token });
        // Set role cookie for middleware
        document.cookie = `academy-role=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}`;
      },

      logout: () => {
        set({ isLoggedIn: false, user: null, token: null });
        document.cookie = 'academy-role=; path=/; max-age=0';
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'academy-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
