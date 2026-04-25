import { create } from 'zustand'

interface UIState {
  isToastOpen: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isToastOpen: false,
  toastMessage: null,
  showToast: (msg) => set({ isToastOpen: true, toastMessage: msg }),
  hideToast: () => set({ isToastOpen: false }),
}))
