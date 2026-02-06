import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userType: 'customer' | 'seller' | 'admin' | null;
  userId: string | null;
  phone: string | null;
  email: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userType: null,
  userId: null,
  phone: null,
  email: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userType: 'customer' | 'seller' | 'admin'; userId: string; phone?: string; email?: string }>) => {
      state.isLoggedIn = true;
      state.userType = action.payload.userType;
      state.userId = action.payload.userId;
      state.phone = action.payload.phone || null;
      state.email = action.payload.email || null;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userType = null;
      state.userId = null;
      state.phone = null;
      state.email = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
