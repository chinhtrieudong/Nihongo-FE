import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { loginSuccess, logout } from "./store/slices/userSlice";
import { authAPI, userAPI } from "./services/api";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LessonsList from "./pages/LessonsList";
import Login from "./pages/Login";
import LessonDetail from "./pages/LessonDetail";
import KanjiPage from "./pages/Kanji";
import KanjiDetail from "./pages/KanjiDetail";
import Vocabulary from "./pages/Vocabulary";
import Grammar from "./pages/Grammar";
import Pronunciation from "./pages/Pronunciation";
import "./App.css";

// Component to handle authentication persistence
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        try {
          // Validate token by making a request to get user profile
          const response = await authAPI.refreshToken(refreshToken);
          localStorage.setItem(
            "accessToken",
            response.data.data.tokens.accessToken
          );
          localStorage.setItem(
            "refreshToken",
            response.data.data.tokens.refreshToken
          );

          // Get user profile
          const profileResponse = await userAPI.getProfile();
          if (profileResponse.data?.user) {
            dispatch(loginSuccess(profileResponse.data.user));
          }
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(logout());
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="lessons" element={<LessonsList />} />
            <Route path="lessons/:lessonId" element={<LessonDetail />} />
            <Route path="lessons/:lessonId/kanji" element={<KanjiDetail />} />
            <Route path="kanji" element={<KanjiPage />} />
            <Route path="kanji/:kanji" element={<KanjiDetail />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="grammar" element={<Grammar />} />
            <Route path="pronunciation" element={<Pronunciation />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
