import { jsx as _jsx } from "react/jsx-runtime";
import { cn, getInitials, getAvatarColor } from '@/utils';
const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};
export default function Avatar({ src, name, size = 'md', className, }) {
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);
    if (src) {
        return (_jsx("img", { src: src, alt: name, className: cn('rounded-full object-cover', sizes[size], className) }));
    }
    return (_jsx("div", { className: cn('flex items-center justify-center rounded-full font-semibold text-white', sizes[size], className), style: { backgroundColor: bgColor }, title: name, children: initials }));
}
