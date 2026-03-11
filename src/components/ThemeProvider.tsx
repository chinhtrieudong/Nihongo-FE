import React, { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { getFontPreset } from "../constants/fonts";

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { darkMode, fontPreset } = useAppSelector((state) => state.ui);

    useEffect(() => {
        const root = document.documentElement;

        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        const root = document.documentElement;
        const preset = getFontPreset(fontPreset);
        // Font picker only affects Kanji/Japanese rendering, not the whole UI.
        root.style.setProperty("--kanji-font-family", preset.fontFamily);
    }, [fontPreset]);

    // Initialize dark mode from localStorage on first render
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const root = document.documentElement;

        if (savedDarkMode === 'true') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, []);

    return <>{children}</>;
};

export default ThemeProvider;
