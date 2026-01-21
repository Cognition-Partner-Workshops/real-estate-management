import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useNotifications, useNotificationReadObserver, useRestriction } from '@/hooks';
import { NotificationBadge, Card } from '@/components/ui';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import type { UserNotification } from '@/types';

interface NotificationItemProps {
  notification: UserNotification;
  isChecked: boolean;
  onCheckChange: (id: string, checked: boolean) => void;
  onElementRef: (element: HTMLElement | null, id: string, isRead: boolean) => void;
}

function NotificationItem({
  notification,
  isChecked,
  onCheckChange,
  onElementRef,
}: NotificationItemProps): ReactElement {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onCheckChange(notification.notification_id, e.target.checked);
  };

  const formattedDate = new Date(notification.createdAt).toLocaleDateString();

  return (
    <div
      ref={(el) => onElementRef(el, notification.notification_id, notification.read)}
      className={`flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-3 mt-3 ${
        !notification.read ? 'bg-gray-100 bg-opacity-30 dark:bg-gray-800' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="w-4 h-4 mr-3 text-blue-600 rounded focus:ring-blue-500"
      />
      <div className="flex flex-col md:flex-row md:items-center flex-1 min-w-0">
        <div className="text-sm md:text-base text-gray-800 dark:text-gray-200 truncate flex-1">
          {notification.message}
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0 md:ml-4">
          <NotificationBadge notificationType={notification.type} />
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function NotificationsPage(): ReactElement {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, markAsRead, deleteNotifications } = useNotifications();
  const { restricted, showAlert } = useRestriction();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkAsRead = useCallback(
    async (ids: string[]): Promise<void> => {
      await markAsRead(ids);
    },
    [markAsRead]
  );

  const { observeElement, cleanup } = useNotificationReadObserver({
    onRead: handleMarkAsRead,
    debounceMs: 3000,
  });

  useEffect(() => {
    return (): void => {
      cleanup();
    };
  }, [cleanup]);

  const handleCheckChange = useCallback((id: string, checked: boolean): void => {
    setCheckedIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  }, []);

  const handleDeleteSelected = async (): Promise<void> => {
    if (restricted) {
      showAlert();
      return;
    }

    if (checkedIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteNotifications(checkedIds);

    if (result) {
      dispatch(
        addNotification({
          type: result.success ? 'success' : 'error',
          message: result.message || (result.success ? 'Notifications deleted' : 'Delete failed'),
        })
      );
    }

    setCheckedIds([]);
    setIsDeleting(false);
  };

  const handleElementRef = useCallback(
    (element: HTMLElement | null, id: string, isRead: boolean): void => {
      observeElement(element, id, isRead);
    },
    [observeElement]
  );

  return (
    <div className="p-4 lg:p-8">
      <Card className="shadow-none border border-slate-200 dark:border-slate-800">
        <div className="bg-blue-600 px-4 py-3 flex flex-row justify-between items-center rounded-t-lg">
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            Notifications
            {checkedIds.length > 0 && (
              <span className="text-base ml-2">- Selected ({checkedIds.length})</span>
            )}
          </h1>

          {checkedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isLoading || isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete
            </button>
          )}
        </div>

        <div className="p-4">
          {notifications.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  isChecked={checkedIds.includes(notification.notification_id)}
                  onCheckChange={handleCheckChange}
                  onElementRef={handleElementRef}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-lg text-gray-600 dark:text-gray-400">
                You have no notifications.
              </h2>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default NotificationsPage;
