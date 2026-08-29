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
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200 min-w-[90px] border ${
        isActive
          ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/30 scale-105'
          : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50 hover:border-neutral-300 dark:bg-neutral-850 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:border-neutral-700'
      }`}
    >
      <span className="text-3xl filter drop-shadow-sm">{category.icon}</span>
      <span className="text-xs font-bold whitespace-nowrap">{category.name}</span>
      {category.itemCount > 0 && (
        <span className={`text-[10px] font-medium ${isActive ? 'text-white/80' : 'text-neutral-400 dark:text-neutral-500'}`}>
          {category.itemCount} items
        </span>
      )}
    </button>
  );
}


