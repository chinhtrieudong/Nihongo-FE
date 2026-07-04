import { beforeEach, describe, expect, it, vi } from "vitest";
import reducer, {
  addNotification,
  clearLoading,
  clearNotifications,
  closeDrawer,
  markAllNotificationsRead,
  markNotificationRead,
  openDrawer,
  removeNotification,
  setCurrentView,
  setDarkMode,
  setFontPreset,
  setLoading,
  toggleDarkMode,
  toggleSidebar,
} from "./uiSlice";

describe("uiSlice", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("persists dark mode and font preset preferences", () => {
    const darkState = reducer(undefined, setDarkMode(true));
    const lightState = reducer(darkState, toggleDarkMode());
    const fontState = reducer(lightState, setFontPreset("noto-sans-jp"));

    expect(darkState.darkMode).toBe(true);
    expect(lightState.darkMode).toBe(false);
    expect(fontState.fontPreset).toBe("noto-sans-jp");
    expect(localStorage.getItem("darkMode")).toBe("false");
    expect(localStorage.getItem("fontPreset")).toBe("noto-sans-jp");
  });

  it("manages navigation surface state", () => {
    const sidebarState = reducer(undefined, toggleSidebar());
    const openDrawerState = reducer(sidebarState, openDrawer());
    const closedDrawerState = reducer(openDrawerState, closeDrawer());
    const viewState = reducer(closedDrawerState, setCurrentView("grammar"));

    expect(sidebarState.sidebarOpen).toBe(true);
    expect(openDrawerState.drawerOpen).toBe(true);
    expect(closedDrawerState.drawerOpen).toBe(false);
    expect(viewState.currentView).toBe("grammar");
  });

  it("adds, reads, removes, and clears notifications", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T07:00:00.000Z"));

    const addedState = reducer(
      undefined,
      addNotification({
        type: "success",
        title: "Saved",
        message: "Progress saved",
      }),
    );

    expect(addedState.notifications).toHaveLength(1);
    expect(addedState.notifications[0]).toMatchObject({
      id: String(Date.now()),
      read: false,
      timestamp: "2026-07-04T07:00:00.000Z",
    });

    const notificationId = addedState.notifications[0].id;
    const readState = reducer(addedState, markNotificationRead(notificationId));
    expect(readState.notifications[0].read).toBe(true);

    const unreadState = reducer(
      readState,
      addNotification({ type: "info", title: "Next", message: "Second" }),
    );
    const allReadState = reducer(unreadState, markAllNotificationsRead());
    expect(allReadState.notifications.every((notification) => notification.read)).toBe(true);

    const removedState = reducer(allReadState, removeNotification(notificationId));
    expect(removedState.notifications.some((notification) => notification.id === notificationId)).toBe(false);

    const clearedState = reducer(removedState, clearNotifications());
    expect(clearedState.notifications).toEqual([]);
  });

  it("sets and clears keyed loading states", () => {
    const loadingState = reducer(undefined, setLoading({ key: "lessons", loading: true }));
    const clearedState = reducer(loadingState, clearLoading("lessons"));

    expect(loadingState.loadingStates.lessons).toBe(true);
    expect(clearedState.loadingStates.lessons).toBeUndefined();
  });
});
