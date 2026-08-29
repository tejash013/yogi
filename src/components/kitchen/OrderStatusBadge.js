import { jsx as _jsx } from "react/jsx-runtime";
import Badge from '@/components/ui/Badge';
const statusConfig = {
    new: { label: 'New', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    preparing: { label: 'Preparing', variant: 'primary' },
    ready: { label: 'Ready', variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'error' },
    cancelled: { label: 'Cancelled', variant: 'neutral' },
};
export default function OrderStatusBadge({ status, size = 'sm', dot = true }) {
    const config = statusConfig[status];
    return (_jsx(Badge, { variant: config.variant, size: size, dot: dot, children: config.label }));
}
