import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import { store } from "./store";
import { useAppSelector } from "./store/hooks";
import { ErrorBoundary, ThemeProvider } from "./components/common";
import { Layout } from "./components/layout";
import Home from "./pages/home/Home";
import KanjiPage from "./pages/kanji/KanjiPage";
import KanjiDetail from "./pages/kanji/KanjiDetail";
import RadicalDetail from "./pages/kanji/RadicalDetail";
import Grammar from "./pages/grammar/Grammar";
import Pronunciation from "./pages/pronunciation/ComingSoon";
import Practice from "./pages/practice/Practice";
import BunkeiDetail from "./pages/practice/BunkeiDetail";
import KaiwaDetail from "./pages/practice/KaiwaDetail";
import MondaiDetail from "./pages/practice/MondaiDetail";
import ReibunDetail from "./pages/practice/ReibunDetail";
import RenshuuDetail from "./pages/practice/RenshuuDetail";
import TangoDetail from "./pages/practice/TangoDetail";
import VocabularyDetail from "./pages/vocabulary/VocabularyDetail";
import Tests from "./pages/tests/Tests";
import TestDetail from "./pages/tests/TestDetail";
import TestResults from "./pages/tests/TestResults";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ComponentsDemo from "./pages/demo/ComponentsDemo";
import ApiTest from "./pages/ApiTest";
import TextbookDetail from "./pages/textbook/TextbookDetail";
import QuickTest from "./pages/textbook/QuickTest";
import { Lessons } from "./components/lessons";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminRoute, AdminLayout } from "./components/admin";
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
            <Route path="/api-test" element={<ApiTest />} />

            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="lessons/:lessonNumber/kanji" element={<KanjiDetail />} />
              <Route path="textbook/:textbookId" element={<TextbookDetail />} />
              <Route path="textbook/:textbookId/vocabulary/:lessonNumber" element={<VocabularyDetail />} />
              <Route path="textbook/:textbookId/quick-test" element={<QuickTest />} />
              <Route path="mina/:lessonId" element={<Lessons />} />
              <Route path="tango/:lessonId" element={<Lessons />} />
              <Route path="jlpt/:level/:lessonId" element={<Lessons />} />
              <Route path="kanji" element={<KanjiPage />} />
              <Route path="kanji/radicals/:symbol" element={<RadicalDetail />} />
              <Route path="kanji/:kanji" element={<KanjiDetail />} />
              <Route path="grammar" element={<Grammar />} />
              <Route path="pronunciation" element={<Pronunciation />} />
              <Route path="tests" element={<Tests />} />
              <Route path="test/:testId" element={<TestDetail />} />
              <Route path="test-results/:testId" element={<TestResults />} />
              <Route path="components-demo" element={<ComponentsDemo />} />
              <Route path="practice" element={<Practice />} />
              <Route path="practice/bunkei/:lessonNumber" element={<BunkeiDetail />} />
              <Route path="practice/kaiwa/:lessonNumber" element={<KaiwaDetail />} />
              <Route path="practice/mondai/:lessonNumber" element={<MondaiDetail />} />
              <Route path="practice/reibun/:lessonNumber" element={<ReibunDetail />} />
              <Route path="practice/renshuu/:lessonNumber" element={<RenshuuDetail />} />
              <Route path="practice/tango/:lessonId" element={<TangoDetail />} />

            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<div>Admin Dashboard</div>} />
            </Route>
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uiFontFamily, japaneseFontFamily, fontPreset } = useAppSelector((state) => state.ui);

  useEffect(() => {
    const root = document.documentElement;

    // Map font keys to CSS font-family values
    const uiFontMap: Record<string, string> = {
      default: "'Itim', 'Noto Sans', system-ui, sans-serif",
      noto_sans: "'Noto Sans', sans-serif",
      inter: "'Inter', sans-serif",
      poppins: "'Poppins', sans-serif",
      roboto: "'Roboto', sans-serif",
      be_vietnam: "'Be Vietnam Pro', sans-serif",
      montserrat: "'Montserrat', sans-serif",
    };

    const japaneseFontMap: Record<string, string> = {
      default_jp: "'Noto Sans JP', sans-serif",
      noto_sans_jp: "'Noto Sans JP', sans-serif",
      noto_serif_jp: "'Noto Serif JP', serif",
      zen_kaku_gothic: "'Zen Kaku Gothic New', sans-serif",
      shippori_mincho: "'Shippori Mincho', serif",
      sawarabi_gothic: "'Sawarabi Gothic', sans-serif",
    };

    const kanjiFontMap: Record<string, string> = {
      noto_sans_jp: '"Noto Sans JP", "Noto Sans", system-ui, sans-serif',
      noto_serif_jp: '"Noto Serif JP", "Noto Sans", system-ui, serif',
      zen_maru_gothic: '"Zen Maru Gothic", "Noto Serif JP", "Noto Sans", system-ui, sans-serif',
      yuji_syuku: '"Yuji Syuku", "Noto Serif JP", "Noto Sans", system-ui, serif',
      rocknroll_one: '"RocknRoll One", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
      itim: '"Itim", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    };

    // Apply UI font
    const uiFont = uiFontMap[uiFontFamily] || uiFontMap.default;
    root.style.setProperty('--app-font-family', uiFont);

    // Apply Japanese font
    const jpFont = japaneseFontMap[japaneseFontFamily] || japaneseFontMap.default_jp;
    root.style.setProperty('--jp-font-family', jpFont);

    // Apply Kanji font
    const kanjiFont = kanjiFontMap[fontPreset] || kanjiFontMap.noto_serif_jp;
    root.style.setProperty('--kanji-font-family', kanjiFont);

  }, [uiFontFamily, japaneseFontFamily, fontPreset]);

  return <>{children}</>;
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
      <FontProvider>
        <AppContent />
      </FontProvider>
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
