import type { ReactNode } from 'react';
import { cn } from '@/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-7', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-3" />
      )}
      <div className="overflow-hidden rounded-[28px] border border-[#e7dccf] bg-gradient-to-r from-[#f8f3ec] via-[#fffdfb] to-[#f4efe8] p-5 shadow-[0_18px_50px_rgba(120,93,60,0.08)] dark:border-neutral-700 dark:from-[#1a1715] dark:via-[#1b1a18] dark:to-[#171512] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d9c2a4] bg-[#f7eddc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c6934] dark:border-[#5b4833] dark:bg-[#2b241d] dark:text-[#f0d7aa]">
              Restaurant operations
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.04em] text-neutral-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

