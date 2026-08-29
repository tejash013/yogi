import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
export default function Error403() {
    return (_jsx("div", { className: "flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-8xl font-bold text-primary-500", children: "403" }), _jsx("h2", { className: "mt-4 text-2xl font-semibold text-neutral-900 dark:text-white", children: "Access Denied" }), _jsx("p", { className: "mt-2 text-neutral-500", children: "You don't have permission to access this page." }), _jsxs("div", { className: "mt-8 flex items-center justify-center gap-4", children: [_jsx(Link, { to: ROUTES.DEFAULT, children: _jsx(Button, { children: "Go Home" }) }), _jsx(Link, { to: ROUTES.AUTH.LOGIN, children: _jsx(Button, { variant: "outline", children: "Sign In" }) })] })] }) }));
}
