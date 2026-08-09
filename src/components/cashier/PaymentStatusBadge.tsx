import type { CashierPaymentStatus } from '@/types/cashier';
import { PAYMENT_STATUS_LABELS } from '@/types/cashier';
import Badge from '@/components/ui/Badge';

const variantMap: Record<CashierPaymentStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  paid: 'success',
  unpaid: 'error',
  pending: 'warning',
  partially_paid: 'warning',
  partially_refunded: 'info',
  refunded: 'info',
  failed: 'error',
};

export default function PaymentStatusBadge({
  status,
  size = 'sm',
}: {
  status: CashierPaymentStatus;
  size?: 'sm' | 'md';
}) {
  return (
    <Badge variant={variantMap[status]} size={size} dot>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
