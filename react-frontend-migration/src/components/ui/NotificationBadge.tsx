import type { ReactElement } from 'react';
import { UserNotificationType } from '@/types';

type NotificationBadgeColor = 'success' | 'primary' | 'tertiary';

interface NotificationBadgeProps {
  notificationType: string;
  className?: string;
}

const notificationTypeColorMap: Record<string, NotificationBadgeColor> = {
  [UserNotificationType.Account]: 'success',
  [UserNotificationType.System]: 'primary',
};

const colorStyles: Record<NotificationBadgeColor, string> = {
  success: 'bg-green-100 text-green-800',
  primary: 'bg-blue-100 text-blue-800',
  tertiary: 'bg-gray-100 text-gray-600',
};

function getNotificationBadgeColor(notificationType: string): NotificationBadgeColor {
  return notificationTypeColorMap[notificationType] ?? 'tertiary';
}

function NotificationBadge({
  notificationType,
  className = '',
}: NotificationBadgeProps): ReactElement {
  const color = getNotificationBadgeColor(notificationType);
  const colorStyle = colorStyles[color];

  return (
    <span
      className={`inline-flex items-center py-1 px-2 rounded-full text-xs md:text-sm font-medium ${colorStyle} ${className}`}
    >
      {notificationType}
    </span>
  );
}

export { NotificationBadge };
export default NotificationBadge;
