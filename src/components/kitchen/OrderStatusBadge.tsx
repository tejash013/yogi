import Badge from '@/components/ui/Badge';
import type { KitchenStatus } from '@/types/kitchen';

const statusConfig: Record<
  KitchenStatus,
  { label: string; variant: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'neutral' }
> = {
  new: { label: 'New', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  preparing: { label: 'Preparing', variant: 'primary' },
  ready: { label: 'Ready', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

interface Props {
  status: KitchenStatus;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function OrderStatusBadge({ status, size = 'sm', dot = true }: Props) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} dot={dot}>
      {config.label}
    </Badge>
  );
}
