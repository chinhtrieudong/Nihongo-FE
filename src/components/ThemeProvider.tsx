import React, { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { darkMode } = useAppSelector((state) => state.ui);

    useEffect(() => {
        const root = document.documentElement;

        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

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
