import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import { store } from "./store";
import { useAppSelector } from "./store/hooks";
import ThemeProvider from "./components/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import LessonsList from "./pages/LessonsList";
import LessonDetail from "./pages/LessonDetail";
import KanjiPage from "./pages/Kanji";
import KanjiDetail from "./pages/KanjiDetail";
import RadicalDetail from "./pages/RadicalDetail";
import Vocabulary from "./pages/Vocabulary";
import VocabularyPage from "./pages/VocabularyPage";
import Grammar from "./pages/Grammar";
import Pronunciation from "./pages/Pronunciation";
import ConversationComponent from "./pages/Conversation";
import ConversationLesson from "./pages/ConversationLesson";
import Tests from "./pages/Tests";
import TestDetail from "./pages/TestDetail";
import TestResults from "./pages/TestResults";
import Login from "./pages/Login";
import Register from "./pages/Register";
import IconShowcase from "./components/IconShowcase";
import APITester from "./components/APITester";
import AdminDashboard from "./pages/AdminDataManager";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import "./App.css";
import "./styles/academic-grid.css";

// Component to handle app with authentication
const AppContent: React.FC = () => {
  const { isLoading, isInitialized } = useAuth();

  // Show loading screen while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">
            Đang khởi tạo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <div className="min-h-screen text-secondary-900 dark:text-secondary-100">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<LessonsList />} />
              <Route path="lessons" element={<LessonsList />} />
              <Route path="lessons/:lessonNumber" element={<ErrorBoundary><LessonDetail /></ErrorBoundary>} />
              <Route path="lessons/:lessonNumber/kanji" element={<KanjiDetail />} />
              <Route path="kanji" element={<KanjiPage />} />
              <Route path="kanji/radicals/:symbol" element={<RadicalDetail />} />
              <Route path="kanji/:kanji" element={<KanjiDetail />} />
              <Route path="vocabulary" element={<Vocabulary />} />
              <Route path="vocabulary-list/:lessonNumber" element={<VocabularyPage />} />
              <Route path="grammar" element={<Grammar />} />
              <Route path="pronunciation" element={<Pronunciation />} />
              <Route path="conversation" element={<ConversationComponent />} />
              <Route
                path="conversation/:lessonId"
                element={<ConversationLesson />}
              />
              <Route path="tests" element={<Tests />} />
              <Route path="test/:testId" element={<TestDetail />} />
              <Route path="test-results/:testId" element={<TestResults />} />
              <Route path="icon-showcase" element={<IconShowcase />} />
              <Route path="api-tester" element={<APITester />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

const AppWithTheme: React.FC = () => {
  const { darkMode } = useAppSelector((state) => state.ui);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: "var(--app-font-family)",
        },
      }}
    >
      <AppContent />
    </ConfigProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <AntdApp>
            <AppWithTheme />
          </AntdApp>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
