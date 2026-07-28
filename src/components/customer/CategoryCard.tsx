import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  isActive?: boolean;
  onClick: (id: string) => void;
}

export default function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={() => onClick(category.id)}
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200 min-w-[90px] ${
        isActive
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
      }`}
    >
      <span className="text-3xl">{category.icon}</span>
      <span className="text-xs font-semibold whitespace-nowrap">{category.name}</span>
      {category.itemCount > 0 && (
        <span className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-neutral-400'}`}>
          {category.itemCount} items
        </span>
      )}
    </button>
  );
}

