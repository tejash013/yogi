interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationPickerModal({ isOpen, onClose }: LocationPickerModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-800 text-center">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Branch Selection</h3>
        <p className="mt-2 text-xs text-neutral-500">Please select your preferred branch using the outlet selector in the header.</p>
        <button
          onClick={onClose}
          className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
