import { create } from 'zustand';

interface ShiftState {
  viewMode: 'list' | 'calendar' | 'map';
  setViewMode: (mode: 'list' | 'calendar' | 'map') => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
