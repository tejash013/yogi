import Search from '@/components/ui/Search';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function OrderSearch({ value, onChange }: Props) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Search Order
      </label>
      <Search
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClear={() => onChange('')}
        placeholder="Order / Table / Customer / Phone"
        className="max-w-none"
      />
      <p className="mt-1 text-xs text-neutral-500">
        Search by order number, table number, customer name or phone.
      </p>
    </div>
  );
}
