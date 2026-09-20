import { useState } from 'react';
import type { CashierOrderItem } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

interface Props {
  item: CashierOrderItem;
}

const PRESET_ADDONS = [
  'Extra Onion',
  'No Onion',
  'Extra Cheese',
  'Spicy',
  'Less Spicy',
  'No Mayo',
  'Extra Sauce',
  'Less Salt',
];

export default function BillItem({ item }: Props) {
  const updateQuantity = useCashierStore((s) => s.updateQuantity);
  const removeBillItem = useCashierStore((s) => s.removeBillItem);
  const updateItemCustomization = useCashierStore((s) => s.updateItemCustomization);

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [noteInput, setNoteInput] = useState(item.specialInstructions || '');

  const toggleAddon = (addon: string) => {
    const current = item.addons || [];
    const next = current.includes(addon)
      ? current.filter((a) => a !== addon)
      : [...current, addon];
    updateItemCustomization(item.id, next, noteInput);
  };

  const handleSaveNotes = () => {
    updateItemCustomization(item.id, item.addons || [], noteInput);
    setShowCustomizer(false);
  };

  return (
    <div className="flex flex-col gap-2 border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-700">
      <div className="flex items-start gap-3">
        <img
          src={item.image}
          alt={item.name}
          className="h-14 w-14 shrink-0 rounded-lg bg-neutral-100 object-cover dark:bg-neutral-700"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.variant}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="rounded px-2 py-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                title="Add options like Extra Onion or No Onion"
              >
                📝 Options
              </button>
              <button
                type="button"
                onClick={() => removeBillItem(item.id)}
                className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                aria-label={`Remove ${item.name}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {item.addons && item.addons.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.addons.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          {item.specialInstructions && (
            <p className="mt-0.5 text-xs italic text-amber-600 dark:text-amber-400">
              Note: {item.specialInstructions}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-600">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, -1)}
                className="px-2.5 py-1 text-base font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-neutral-900 dark:text-white">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, 1)}
                className="px-2.5 py-1 text-base font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatINR(item.unitPrice)} × {item.quantity}
              </p>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {formatINR(item.quantity * item.unitPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Inline Customization Drawer */}
      {showCustomizer && (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/30 animate-in fade-in duration-150">
          <p className="font-bold text-amber-900 uppercase text-[10px] dark:text-amber-200">
            Customize Item Options:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESET_ADDONS.map((addon) => {
              const isSelected = item.addons?.includes(addon);
              return (
                <button
                  key={addon}
                  type="button"
                  onClick={() => toggleAddon(addon)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all border ${
                    isSelected
                      ? 'border-red-500 bg-red-500 text-white shadow-sm'
                      : 'border-amber-300 bg-white text-neutral-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{addon}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5">
            <input
              type="text"
              placeholder="Custom instructions (e.g., extra spicy, no salad)..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:border-amber-500 focus:outline-none dark:border-amber-800 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="rounded-lg bg-amber-500 text-white px-3 py-1 text-[11px] font-bold hover:bg-amber-600 shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
