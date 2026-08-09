import { useState } from 'react';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import type { Payment } from '@/types/cashier';
import { PAYMENT_METHOD_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

interface Props {
  payment: Payment | null;
  onClose: () => void;
}

export default function RefundModal({ payment, onClose }: Props) {
  const refundPayment = useCashierStore((s) => s.refundPayment);
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!payment) return null;

  const maxRefund = payment.amount;
  const parsed = parseFloat(refundAmount);

  const handleFull = () => {
    setRefundAmount(String(maxRefund));
    setError('');
  };

  const handleConfirm = () => {
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid refund amount.');
      return;
    }
    if (parsed > maxRefund) {
      setError(`Refund cannot exceed ${formatINR(maxRefund)}.`);
      return;
    }
    refundPayment(payment.id, parsed, reason.trim() || 'Customer refund');
    setRefundAmount('');
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={!!payment} onClose={onClose} title="Process Refund" size="md">
      <div className="space-y-4">
        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Original Amount</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatINR(payment.amount)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-neutral-500">Payment Method</span>
            <span className="font-medium text-neutral-900 dark:text-white">
              {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Refund Amount
            </span>
            <button
              type="button"
              onClick={handleFull}
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              Full Refund
            </button>
          </div>
          <Input
            type="number"
            min={0}
            max={maxRefund}
            value={refundAmount}
            onChange={(e) => {
              setRefundAmount(e.target.value);
              setError('');
            }}
            placeholder={`0 – ${formatINR(maxRefund)}`}
          />
          {error && <p className="mt-1 text-sm text-error">{error}</p>}
        </div>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Refund reason (e.g. Order cancelled, item missing)"
          rows={3}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Confirm Refund
          </Button>
        </div>
      </div>
    </Modal>
  );
}
