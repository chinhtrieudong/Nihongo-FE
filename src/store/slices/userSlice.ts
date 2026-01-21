import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  currentLevel: "N5" | "N4" | "N3" | "N2";
  totalXp: number;
  streakDays: number;
  lastLogin?: string;
  createdAt?: string;
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    updateXp: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.totalXp += action.payload;
      }
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.streakDays = action.payload;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateXp,
  updateStreak,
} = userSlice.actions;

export default userSlice.reducer;
