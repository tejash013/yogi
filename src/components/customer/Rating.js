import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function Rating({ value, onChange, size = 'md', readonly = false, showValue = false, totalReviews, }) {
    const [hover, setHover] = useState(0);
    const starSize = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-8 w-8',
    };
    const handleClick = (star) => {
        if (!readonly && onChange) {
            onChange(star);
        }
    };
    return (_jsxs("div", { className: "inline-flex items-center gap-1", children: [[1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => handleClick(star), onMouseEnter: () => !readonly && setHover(star), onMouseLeave: () => !readonly && setHover(0), className: `transition-all duration-150 ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`, disabled: readonly, children: _jsx("svg", { className: `${starSize[size]} ${star <= (hover || value)
                        ? 'text-yellow-400'
                        : 'text-neutral-300 dark:text-neutral-600'}`, fill: star <= (hover || value) ? 'currentColor' : 'none', stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: star <= (hover || value) ? 0 : 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }) }, star))), showValue && (_jsxs("span", { className: "ml-1 text-sm font-medium text-neutral-600 dark:text-neutral-400", children: [value.toFixed(1), totalReviews !== undefined && (_jsxs("span", { className: "text-neutral-400", children: [" (", totalReviews, ")"] }))] }))] }));
}
