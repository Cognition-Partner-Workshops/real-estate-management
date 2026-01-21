import type { ReactElement, ReactNode } from 'react';

type AlertVariant = 'danger' | 'warning' | 'success' | 'error' | 'info';

interface AlertCardProps {
  children?: ReactNode;
  variant?: AlertVariant;
  content?: string;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  danger: 'border-red-500 bg-red-500/35 text-red-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'border-yellow-500 bg-yellow-500/30 text-yellow-700',
  success: 'border-green-500 bg-green-500/25 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

function AlertCard({
  children,
  variant = 'danger',
  content = 'Alert Something is wrong',
  className = '',
}: AlertCardProps): ReactElement {
  const hasChildren = children !== undefined && children !== null;

  return (
    <div
      className={`flex items-start gap-1.5 px-4 py-1.5 rounded-lg border ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex items-start">
        {hasChildren ? children : <span>{content}</span>}
      </div>
    </div>
  );
}

export default AlertCard;
