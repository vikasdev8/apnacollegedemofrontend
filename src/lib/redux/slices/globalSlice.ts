import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string | Date;
}

interface GlobalState {
  theme: 'light' | 'dark';
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: GlobalState = {
  theme: 'light',
  loading: false,
  user: null,
  isAuthenticated: false,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {
  setTheme,
  setLoading,
  setUser,
  clearUser,
  setAuthenticated,
} = globalSlice.actions;

export default globalSlice.reducer;