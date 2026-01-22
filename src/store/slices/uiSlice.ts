import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  currentView:
    | "dashboard"
    | "lessons"
    | "vocabulary"
    | "grammar"
    | "pronunciation"
    | "conversation"
    | "tests"
    | "profile";
  notifications: Notification[];
  loadingStates: Record<string, boolean>;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const getInitialState = (): UiState => {
  const savedDarkMode = localStorage.getItem('darkMode');
  return {
    darkMode: savedDarkMode === 'true',
    sidebarOpen: false,
    currentView: "dashboard",
    notifications: [],
    loadingStates: {},
  };
};

const initialState: UiState = getInitialState();

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentView: (state, action: PayloadAction<UiState["currentView"]>) => {
      state.currentView = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "timestamp" | "read">>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      state.loadingStates[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingStates[action.payload];
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  setCurrentView,
  addNotification,
  removeNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  setLoading,
  clearLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
