import { getRelativeTime } from '@/utils';
import { useKitchenStore } from '@/store';

const typeIcon = {
  info: '🔔',
  warning: '⚠️',
  error: '🚨',
  success: '✅',
};

const typeColor = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

/**
 * Dropdown panel listing kitchen notifications.
 * Supports marking individual notifications as read and clearing all.
 */
export default function NotificationPanel() {
  const store = useKitchenStore();

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-dropdown dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</h3>
        <button
          onClick={store.markAllNotificationsRead}
          className="text-xs font-medium text-primary-500 hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {store.notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No notifications
          </div>
        ) : (
          store.notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-700 ${
                n.isRead ? 'opacity-60' : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${typeColor[n.type]}`}
              >
                {typeIcon[n.type]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{n.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{n.message}</p>
                <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                  {getRelativeTime(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => store.markNotificationRead(n.id)}
                  className="self-start rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300"
                >
                  Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
