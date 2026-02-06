import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  userPhone: string | null;
  userName: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userId: null,
  userPhone: null,
  userName: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userId: string; userPhone: string; userName?: string }>) => {
      state.isLoggedIn = true;
      state.userId = action.payload.userId;
      state.userPhone = action.payload.userPhone;
      state.userName = action.payload.userName || 'Guest';
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userId = null;
      state.userPhone = null;
      state.userName = null;
    },
    updateUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
  },
});

export const { login, logout, updateUserName } = authSlice.actions;
export default authSlice.reducer;
