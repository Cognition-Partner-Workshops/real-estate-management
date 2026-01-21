import type { ReactElement } from 'react';
import { PropertyType } from '@/types';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
};

function Badge({ children, variant = 'default', className = '' }: BadgeProps): ReactElement {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface PropertyBadgeProps {
  type: PropertyType;
  className?: string;
}

const propertyTypeColors: Record<PropertyType, string> = {
  [PropertyType.Residential]: 'bg-green-100 text-green-800',
  [PropertyType.Commercial]: 'bg-blue-100 text-blue-800',
  [PropertyType.Industrial]: 'bg-yellow-100 text-yellow-800',
  [PropertyType.Land]: 'bg-purple-100 text-purple-800',
};

function PropertyBadge({ type, className = '' }: PropertyBadgeProps): ReactElement {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${propertyTypeColors[type]} ${className}`}
    >
      {type}
    </span>
  );
}

export { Badge, PropertyBadge };
export default Badge;
