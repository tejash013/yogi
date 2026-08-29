import { create } from 'zustand';
const getInitialTheme = () => {
    if (typeof window === 'undefined')
        return 'light';
    const stored = localStorage.getItem('restaurantos-theme');
    if (stored === 'light' || stored === 'dark')
        return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};
const applyTheme = (theme) => {
    if (typeof document === 'undefined')
        return;
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    }
    else {
        root.classList.remove('dark');
    }
    localStorage.setItem('restaurantos-theme', theme);
};
export const useThemeStore = create((set) => {
    const initial = getInitialTheme();
    applyTheme(initial);
    return {
        theme: initial,
        setTheme: (theme) => {
            applyTheme(theme);
            set({ theme });
        },
        toggleTheme: () => set((state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
            return { theme: newTheme };
        }),
    };
});
