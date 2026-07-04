import { describe, expect, it, beforeEach, vi } from "vitest";
import reducer, {
  loginFailure,
  loginStart,
  loginSuccess,
  logout,
  updateStreak,
  updateUser,
  updateXp,
} from "./userSlice";

vi.mock("../../services/api", () => ({
  authAPI: {
    logout: vi.fn(),
  },
}));

const user = {
  id: "u1",
  username: "sakura",
  email: "sakura@example.com",
  role: "student",
  totalXp: 10,
  streakDays: 2,
};

describe("userSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tracks the login lifecycle", () => {
    const loadingState = reducer(undefined, loginStart());

    expect(loadingState.isLoading).toBe(true);
    expect(loadingState.error).toBeNull();

    const loggedInState = reducer(loadingState, loginSuccess(user));

    expect(loggedInState.isLoading).toBe(false);
    expect(loggedInState.isAuthenticated).toBe(true);
    expect(loggedInState.currentUser).toEqual(user);
    expect(loggedInState.error).toBeNull();

    const failedState = reducer(loggedInState, loginFailure("Invalid credentials"));

    expect(failedState.isLoading).toBe(false);
    expect(failedState.error).toBe("Invalid credentials");
  });

  it("updates profile fields, XP, and streak for the current user", () => {
    const initialState = reducer(undefined, loginSuccess(user));

    const renamedState = reducer(initialState, updateUser({ username: "hana" }));
    const xpState = reducer(renamedState, updateXp(15));
    const streakState = reducer(xpState, updateStreak(7));

    expect(streakState.currentUser).toMatchObject({
      username: "hana",
      totalXp: 25,
      streakDays: 7,
    });
  });

  it("clears auth state and tokens on logout", () => {
    localStorage.setItem("accessToken", "access-token");
    localStorage.setItem("refreshToken", "refresh-token");

    const loggedInState = reducer(undefined, loginSuccess(user));
    const loggedOutState = reducer(loggedInState, logout());

    expect(loggedOutState.currentUser).toBeNull();
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});
