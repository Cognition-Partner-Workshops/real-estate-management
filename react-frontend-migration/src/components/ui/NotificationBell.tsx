import { useState, useEffect, useCallback, useMemo, useRef, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '@/store';
import {
  removeNotificationFromList,
  markNotificationsAsRead,
} from '@/store/slices';
import { deleteNotification, readNotifications } from '@/api';
import type { UserNotification, UserNotificationType } from '@/types';

interface NotificationBadgeProps {
  notificationType: UserNotificationType;
}

const notificationTypeColors: Record<UserNotificationType, string> = {
  ACCOUNT: 'bg-blue-100 text-blue-800',
  ENQUIRY: 'bg-green-100 text-green-800',
  PROPERTY: 'bg-purple-100 text-purple-800',
  SYSTEM: 'bg-gray-100 text-gray-800',
};

function NotificationBadge({ notificationType }: NotificationBadgeProps): ReactElement {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${notificationTypeColors[notificationType]}`}
    >
      {notificationType.toLowerCase()}
    </span>
  );
}

interface NotificationItemProps {
  notification: UserNotification;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onDelete }: NotificationItemProps): ReactElement {
  return (
    <div className="group p-2 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-sm">
      <div className="flex flex-col w-full">
        <NotificationBadge notificationType={notification.type} />
        <p
          className={`w-full flex justify-between items-start text-sm mt-1 ${!notification.read ? 'font-bold' : ''}`}
        >
          <span className="text-ellipsis line-clamp-1 group-hover:line-clamp-none">
            {notification.message}
          </span>
          <button
            onClick={() => onDelete(notification.notification_id)}
            className="hover:bg-red-600 py-1 px-2 ml-1 rounded-md bg-red-500 border-slate-200 dark:border-slate-800 flex-shrink-0"
            aria-label="Delete notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </p>
      </div>
    </div>
  );
}

function NotificationBell(): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const accessToken = useAppSelector((state) => state.user.accessToken);
  const allNotifications = useAppSelector((state) => state.notifications.notifications);

  const displayedNotifications = useMemo(
    () => allNotifications.slice(0, 3),
    [allNotifications]
  );

  const unreadNotifications = useMemo(
    () => allNotifications.filter((item) => !item.read),
    [allNotifications]
  );

  const unreadCount = unreadNotifications.length;

  const markAsReadDebounced = useCallback((): void => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (unreadNotifications.length === 0) {
        return;
      }

      const ids = unreadNotifications.map((item) => item.notification_id);
      try {
        const res = await readNotifications(ids);
        if (res.data && res.data.length > 0) {
          dispatch(markNotificationsAsRead(res.data.map((item) => item.notification_id)));
        }
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }, 2000);
  }, [unreadNotifications, dispatch]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAsReadDebounced();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen, unreadCount, markAsReadDebounced]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleNotification = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleDeleteNotification = useCallback(
    async (id: string): Promise<void> => {
      try {
        const res = await deleteNotification(id);
        if (res.success) {
          dispatch(removeNotificationFromList(id));
        }
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [dispatch]
  );

  const handleViewAll = useCallback((): void => {
    setIsOpen(false);
    setTimeout(() => {
      navigate('/user/account/notifications');
    }, 300);
  }, [navigate]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleNotification}
        disabled={!accessToken}
        className="p-0 relative bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {accessToken ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        )}
        {unreadCount > 0 && (
          <span className="absolute bg-red-600 text-white font-semibold -top-1 -left-2 w-5 h-5 text-xs flex justify-center items-center rounded-full border border-slate-200 dark:border-slate-800">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 min-w-[300px] md:min-w-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50"
        >
          {displayedNotifications.length > 0 ? (
            <div className="p-4">
              <h1 className="text-base md:text-lg font-light m-0 p-0 mb-3">
                Notifications
              </h1>

              <div className="flex flex-col gap-2">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.notification_id}
                    notification={notification}
                    onDelete={handleDeleteNotification}
                  />
                ))}
              </div>

              <div className="flex justify-center py-3 w-full">
                <button
                  onClick={handleViewAll}
                  className="px-4 py-2 text-sm border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          ) : (
            <div className="h-24 flex justify-center items-center text-lg">
              You have no notifications.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { NotificationBell, NotificationBadge };
export default NotificationBell;
