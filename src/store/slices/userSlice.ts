import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  currentLevel?: "N5" | "N4" | "N3" | "N2";
  totalXp?: number;
  streakDays?: number;
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
      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    updateXp: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.totalXp = (state.currentUser.totalXp || 0) + action.payload;
      }
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.streakDays = action.payload;
      }
    },
  },
});

// Async logout action that calls the API
export const logoutUser = () => async (dispatch: any) => {
  try {
    // Call logout API
    await authAPI.logout();
  } catch (error) {
    // Even if API call fails, we still want to clear local state
    console.error("Logout API call failed:", error);
  } finally {
    // Always clear local state and tokens
    dispatch(logout());
  }
};

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
