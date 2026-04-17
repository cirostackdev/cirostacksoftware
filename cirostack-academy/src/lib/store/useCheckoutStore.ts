import { create } from 'zustand';
import type { Course } from '@/types';

interface CheckoutState {
  course: Course | null;
  plan: 'monthly' | 'annual' | null;
  promoCode: string;
  promoDiscount: number;
  isPromoLoading: boolean;

  setCourse: (course: Course) => void;
  setPlan: (plan: 'monthly' | 'annual') => void;
  setPromoCode: (code: string) => void;
  applyPromo: (discount: number) => void;
  setPromoLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  course: null,
  plan: null,
  promoCode: '',
  promoDiscount: 0,
  isPromoLoading: false,

  setCourse: (course) => set({ course }),
  setPlan: (plan) => set({ plan }),
  setPromoCode: (promoCode) => set({ promoCode }),
  applyPromo: (discount) => set({ promoDiscount: discount }),
  setPromoLoading: (isPromoLoading) => set({ isPromoLoading }),
  reset: () =>
    set({ course: null, plan: null, promoCode: '', promoDiscount: 0 }),
}));
