import type { ReactElement, ReactNode } from 'react';

type AlertVariant = 'error' | 'warning' | 'success' | 'info';

interface AlertCardProps {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

function AlertCard({
  children,
  variant = 'error',
  className = '',
}: AlertCardProps): ReactElement {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border text-sm
        ${variantStyles[variant]}
        ${className}
      `}
      role="alert"
    >
      {children}
    </div>
  );
}

export default AlertCard;
