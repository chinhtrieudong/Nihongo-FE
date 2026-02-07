import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import { store } from "./store";
import { useAppSelector } from "./store/hooks";
import ThemeProvider from "./components/ThemeProvider";
import Layout from "./components/Layout";
import LessonsList from "./pages/LessonsList";
import LessonDetail from "./pages/LessonDetail";
import KanjiPage from "./pages/Kanji";
import KanjiDetail from "./pages/KanjiDetail";
import Vocabulary from "./pages/Vocabulary";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  getAvailableQualityPresets,
  setQualityPreset,
  getQualityPreset,
} from "./services/voicevoxService";
import "./App.css";

// Log available voices to console
const logAvailableVoices = () => {
  const synth = window.speechSynthesis;

  // Load voices asynchronously
  const voices = synth.getVoices();

  if (voices.length === 0) {
    // Some browsers load voices asynchronously
    synth.onvoiceschanged = () => {
      const loadedVoices = synth.getVoices();
      displayVoices(loadedVoices);
    };
  } else {
    displayVoices(voices);
  }
};

const displayVoices = (voices: SpeechSynthesisVoice[]) => {
  console.log(
    "%c🎤 Available Voices & Quality Settings",
    "color: #1890ff; font-size: 16px; font-weight: bold",
  );
  console.log("════════════════════════════════════════════════════");

  // Get all voices
  console.log(
    "%c📢 All Available Voices:",
    "color: #faad14; font-weight: bold",
  );
  voices.forEach((voice, index) => {
    const tag = voice.default ? "🌟" : "  ";
    console.log(
      `  ${tag} [${index}] ${voice.name.padEnd(35)} | ${voice.lang} ${voice.default ? "(default)" : ""}`,
    );
  });

  // Get Japanese voices only
  const japaneseVoices = voices.filter((v) => v.lang.startsWith("ja"));
  console.log(
    "%c🇯🇵 Japanese Voices Only:",
    "color: #52c41a; font-weight: bold",
  );

  if (japaneseVoices.length === 0) {
    console.warn("❌ No Japanese voices found!");
  } else {
    japaneseVoices.forEach((voice) => {
      const voiceIndex = voices.indexOf(voice);
      const tag = voice.default ? "🌟" : "  ";
      console.log(
        `  ${tag} [${voiceIndex}] ${voice.name.padEnd(35)} | ${voice.lang}`,
      );
    });
  }

  // Voice quality presets
  const presets = getAvailableQualityPresets();
  const currentPreset = getQualityPreset();
  console.log(
    "%c🎧 Voice Quality Presets:",
    "color: #13c2c2; font-weight: bold",
  );
  console.log(
    `  Current: ${currentPreset === "CLEAR" ? "✨" : "  "} ${currentPreset}`,
  );
  presets.forEach((preset) => {
    const marker = preset === currentPreset ? "✨" : "  ";
    console.log(`  ${marker} ${preset}`);
  });

  // Usage examples
  console.log("%c💡 Usage Examples:", "color: #eb2f96; font-weight: bold");
  console.log(`
// 🎤 TO SPEAK TEXT:
import { speakWithVoicevox } from './services/voicevoxService';
speakWithVoicevox('こんにちは', 3); // Replace 3 with voice index

// 🎯 TO SPEAK WITH VOICE NAME:
import { speakWithVoiceName } from './services/voicevoxService';
speakWithVoiceName('こんにちは', 'Ayumi');

// 🎧 TO CHANGE VOICE QUALITY:
import { setQualityPreset } from './services/voicevoxService';
setQualityPreset('CLEAR');     // Clearer pronunciation
setQualityPreset('NATURAL');   // Natural sounding
setQualityPreset('FAST');      // Faster delivery
setQualityPreset('NORMAL');    // Standard settings

// 📊 TO GET ALL SPEAKERS:
import { getAvailableSpeakers } from './services/voicevoxService';
getAvailableSpeakers().then(speakers => {
  console.table(speakers);
});

// 📋 TO GET ALL VOICES:
import { getAllAvailableVoices } from './services/voicevoxService';
const allVoices = getAllAvailableVoices();
console.table(allVoices);
  `);

  console.log("════════════════════════════════════════════════════");
};

// Component to handle app with authentication
const AppContent: React.FC = () => {
  const { isLoading, isInitialized } = useAuth();

  // Note: Call logAvailableVoices() in console if needed
  useEffect(() => {
    // Removed automatic logging to keep console clean
  }, []);

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
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<LessonsList />} />
            <Route path="lessons" element={<LessonsList />} />
            <Route path="lessons/:lessonId" element={<LessonDetail />} />
            <Route path="lessons/:lessonId/kanji" element={<KanjiDetail />} />
            <Route path="kanji" element={<KanjiPage />} />
            <Route path="kanji/:kanji" element={<KanjiDetail />} />
            <Route path="vocabulary" element={<Vocabulary />} />
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
          </Route>
        </Routes>
      </div>
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
          fontFamily: 'Nunito, "Kosugi Maru", system-ui, sans-serif',
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
