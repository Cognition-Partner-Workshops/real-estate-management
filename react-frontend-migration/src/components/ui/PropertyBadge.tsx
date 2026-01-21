import type { ReactElement } from 'react';
import { PropertyType } from '@/types';

interface PropertyBadgeProps {
  type: PropertyType;
  className?: string;
}

const propertyTypeColors: Record<PropertyType, string> = {
  [PropertyType.Residential]: 'bg-red-100 text-red-800',
  [PropertyType.Commercial]: 'bg-cyan-100 text-cyan-800',
  [PropertyType.Industrial]: 'bg-yellow-100 text-yellow-800',
  [PropertyType.Land]: 'bg-green-100 text-green-800',
};

const propertyTypeLabels: Record<PropertyType, string> = {
  [PropertyType.Residential]: 'Residential Real Estate',
  [PropertyType.Commercial]: 'Commercial Real Estate',
  [PropertyType.Industrial]: 'Industrial Real Estate',
  [PropertyType.Land]: 'Land Real Estate',
};

function PropertyBadge({ type, className = '' }: PropertyBadgeProps): ReactElement {
  const colorClass = propertyTypeColors[type] ?? 'bg-gray-100 text-gray-800';
  const label = propertyTypeLabels[type] ?? type;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}

export { PropertyBadge };
export default PropertyBadge;
