import Badge from '@/components/ui/Badge';
import type { OrderPriority } from '@/types/kitchen';

const priorityConfig: Record<
  OrderPriority,
  { label: string; variant: 'warning' | 'error' | 'neutral' }
> = {
  normal: { label: 'Normal', variant: 'neutral' },
  high: { label: 'High', variant: 'warning' },
  urgent: { label: 'Urgent', variant: 'error' },
};

interface Props {
  priority: OrderPriority;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function PriorityBadge({ priority, size = 'sm', dot = true }: Props) {
  const config = priorityConfig[priority];
  return (
    <Badge variant={config.variant} size={size} dot={dot}>
      {config.label}
    </Badge>
  );
}
