import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };
    if (submitted) {
        return (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30", children: _jsx("svg", { className: "h-8 w-8 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), _jsx("h2", { className: "text-xl font-bold text-neutral-900 dark:text-white", children: "Check Your Email" }), _jsxs("p", { className: "mt-2 text-sm text-neutral-500", children: ["We've sent a password reset link to ", email] }), _jsx(Link, { to: ROUTES.AUTH.LOGIN, className: "mt-6 inline-block text-sm font-medium text-primary-500 hover:text-primary-600", children: "Back to login" })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: "Forgot Password" }), _jsx("p", { className: "mt-2 text-sm text-neutral-500", children: "Enter your email and we'll send you a reset link" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Email", type: "email", placeholder: "john@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(Button, { type: "submit", fullWidth: true, children: "Send Reset Link" })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-neutral-500", children: ["Remember your password?", ' ', _jsx(Link, { to: ROUTES.AUTH.LOGIN, className: "font-medium text-primary-500 hover:text-primary-600", children: "Sign in" })] })] }));
}
