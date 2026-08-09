import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
const welcomeSlides = [
    {
        icon: '🍕',
        title: 'Fresh & Delicious Food',
        description: 'Explore our wide variety of dishes made with the freshest ingredients by expert chefs.',
    },
    {
        icon: '🚀',
        title: 'Fast & Reliable Service',
        description: 'Quick preparation and delivery to your table or doorstep with real-time order tracking.',
    },
    {
        icon: '🎉',
        title: 'Exclusive Rewards & Offers',
        description: 'Earn reward points, unlock special discounts, and enjoy members-only perks.',
    },
];
export default function WelcomeScreen() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const handleNext = () => {
        if (currentSlide < welcomeSlides.length - 1) {
            setCurrentSlide((prev) => prev + 1);
        }
        else {
            navigate(ROUTES.AUTH.LOGIN);
        }
    };
    const handleSkip = () => {
        navigate(ROUTES.AUTH.LOGIN);
    };
    const slide = welcomeSlides[currentSlide];
    return (_jsxs("div", { className: "fixed inset-0 flex flex-col bg-white dark:bg-neutral-900", children: [_jsx("div", { className: "flex justify-end p-4", children: _jsx("button", { onClick: handleSkip, className: "rounded-full px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800", children: "Skip" }) }), _jsx("div", { className: "flex flex-1 flex-col items-center justify-center px-8", children: _jsxs("div", { className: "animate-fade-in-up text-center", children: [_jsx("div", { className: "mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20", children: _jsx("span", { className: "text-7xl", children: slide.icon }) }), _jsx("h1", { className: "mb-4 text-3xl font-bold text-neutral-900 dark:text-white", children: slide.title }), _jsx("p", { className: "mx-auto max-w-sm text-base leading-relaxed text-neutral-500", children: slide.description })] }, currentSlide) }), _jsxs("div", { className: "p-8", children: [_jsx("div", { className: "mb-8 flex justify-center gap-2", children: welcomeSlides.map((_, index) => (_jsx("button", { onClick: () => setCurrentSlide(index), className: `h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'w-8 bg-primary-500'
                                : 'w-2 bg-neutral-300 dark:bg-neutral-600'}` }, index))) }), _jsx(Button, { fullWidth: true, size: "lg", onClick: handleNext, children: currentSlide === welcomeSlides.length - 1 ? 'Get Started' : 'Next' }), currentSlide === 0 && (_jsxs("p", { className: "mt-4 text-center text-sm text-neutral-500", children: ["Already have an account?", ' ', _jsx("button", { onClick: () => navigate(ROUTES.AUTH.LOGIN), className: "font-medium text-primary-500 hover:text-primary-600", children: "Sign in" })] }))] })] }));
}
