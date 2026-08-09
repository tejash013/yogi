import { jsx as _jsx } from "react/jsx-runtime";
import Badge from '@/components/ui/Badge';
const priorityConfig = {
    normal: { label: 'Normal', variant: 'neutral' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent', variant: 'error' },
};
export default function PriorityBadge({ priority, size = 'sm', dot = true }) {
    const config = priorityConfig[priority];
    return (_jsx(Badge, { variant: config.variant, size: size, dot: dot, children: config.label }));
}
