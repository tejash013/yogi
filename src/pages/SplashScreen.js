import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
export default function SplashScreen() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    navigate(ROUTES.WELCOME);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);
        return () => clearInterval(timer);
    }, [navigate]);
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700", children: [_jsx("div", { className: "animate-fade-in-up mb-8", children: _jsx("div", { className: "mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-lg", children: _jsx("span", { className: "text-5xl font-bold text-white", children: "R" }) }) }), _jsx("h1", { className: "animate-fade-in-up text-4xl font-bold text-white", style: { animationDelay: '0.2s' }, children: "RestaurantOS" }), _jsx("p", { className: "animate-fade-in-up mt-2 text-lg text-white/70", style: { animationDelay: '0.4s' }, children: "Delicious food, delivered fast" }), _jsxs("div", { className: "animate-fade-in-up mt-12 w-48", style: { animationDelay: '0.6s' }, children: [_jsx("div", { className: "h-1.5 overflow-hidden rounded-full bg-white/20", children: _jsx("div", { className: "h-full rounded-full bg-white transition-all duration-300 ease-out", style: { width: `${progress}%` } }) }), _jsx("p", { className: "mt-2 text-center text-sm text-white/60", children: "Loading..." })] })] }));
}
