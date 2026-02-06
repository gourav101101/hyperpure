import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
