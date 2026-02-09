import { create } from 'zustand';
import { notificationsApi } from '../services/api';

interface NotificationState {
  unreadCount: number;
  loadUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  loadUnreadCount: async () => {
    try {
      const data = await notificationsApi.unreadCount();
      set({ unreadCount: data.count });
    } catch {
      // ignore
    }
  },
}));
