import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
export default function OTPVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const handleChange = (index, value) => {
        if (value.length > 1)
            return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Will verify OTP
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: "Verify OTP" }), _jsx("p", { className: "mt-2 text-sm text-neutral-500", children: "Enter the 6-digit code sent to your email" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("div", { className: "mb-6 flex justify-center gap-3", children: otp.map((digit, index) => (_jsx("input", { ref: (el) => { inputRefs.current[index] = el; }, type: "text", maxLength: 1, value: digit, onChange: (e) => handleChange(index, e.target.value), onKeyDown: (e) => handleKeyDown(index, e), className: "h-12 w-12 rounded-lg border border-neutral-300 text-center text-lg font-semibold text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" }, index))) }), _jsx(Button, { type: "submit", fullWidth: true, children: "Verify OTP" })] }), _jsxs("div", { className: "mt-6 text-center", children: [_jsxs("p", { className: "text-sm text-neutral-500", children: ["Didn't receive the code?", ' ', _jsx("button", { className: "font-medium text-primary-500 hover:text-primary-600", children: "Resend" })] }), _jsx(Link, { to: ROUTES.AUTH.LOGIN, className: "mt-2 inline-block text-sm text-neutral-500 hover:text-neutral-700", children: "Back to login" })] })] }));
}
