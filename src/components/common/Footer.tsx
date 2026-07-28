import { APP_CONFIG } from '@/constants';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} {APP_CONFIG.COMPANY_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

