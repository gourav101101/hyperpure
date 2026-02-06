import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from './checkoutSlice';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import locationReducer from './locationSlice';
import wishlistReducer from './wishlistSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    checkout: checkoutReducer,
    auth: authReducer,
    cart: cartReducer,
    location: locationReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
