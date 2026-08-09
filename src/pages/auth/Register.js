import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        // Will be implemented with API
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: "Create Account" }), _jsx("p", { className: "mt-2 text-sm text-neutral-500", children: "Join RestaurantOS and streamline your dining experience" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "First Name", placeholder: "John", value: formData.firstName, onChange: (e) => setFormData({ ...formData, firstName: e.target.value }), required: true }), _jsx(Input, { label: "Last Name", placeholder: "Doe", value: formData.lastName, onChange: (e) => setFormData({ ...formData, lastName: e.target.value }), required: true })] }), _jsx(Input, { label: "Email", type: "email", placeholder: "john@example.com", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true }), _jsx(Input, { label: "Phone", type: "tel", placeholder: "+1-555-0000", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), required: true }), _jsx(Input, { label: "Password", type: "password", placeholder: "Create a password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), required: true }), _jsx(Input, { label: "Confirm Password", type: "password", placeholder: "Confirm your password", value: formData.confirmPassword, onChange: (e) => setFormData({ ...formData, confirmPassword: e.target.value }), required: true }), _jsx(Button, { type: "submit", fullWidth: true, children: "Create Account" })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-neutral-500", children: ["Already have an account?", ' ', _jsx(Link, { to: ROUTES.AUTH.LOGIN, className: "font-medium text-primary-500 hover:text-primary-600", children: "Sign in" })] })] }));
}
