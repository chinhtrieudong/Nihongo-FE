import React, { useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { getFontPreset } from "../../constants/fonts";

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { darkMode, fontPreset, japaneseFontFamily } = useAppSelector((state) => state.ui);

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
        // Use separate font families for kanji and hiragana/katakana
        root.style.setProperty("--kanji-font-family", preset.kanjiFontFamily || preset.fontFamily);
    }, [fontPreset]);

    useEffect(() => {
        const root = document.documentElement;
        // Set Japanese font family based on japaneseFontFamily setting
        const japaneseFontOptions = {
            default_jp: "'Noto Sans JP', sans-serif",
            noto_sans_jp: "'Noto Sans JP', sans-serif",
            noto_serif_jp: "'Noto Serif JP', serif",
            zen_kaku_gothic: "'Zen Kaku Gothic New', sans-serif",
            shippori_mincho: "'Shippori Mincho', serif",
            sawarabi_gothic: "'Sawarabi Gothic', sans-serif",
        };
        const jpFont = japaneseFontOptions[japaneseFontFamily as keyof typeof japaneseFontOptions] || japaneseFontOptions.default_jp;
        root.style.setProperty("--jp-font-family", jpFont);
    }, [japaneseFontFamily]);

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
