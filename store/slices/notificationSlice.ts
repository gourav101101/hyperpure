import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'order' | 'payout' | 'seller' | 'product' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
