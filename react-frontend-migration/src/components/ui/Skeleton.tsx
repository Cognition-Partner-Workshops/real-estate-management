import type { ReactElement } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps): ReactElement {
  const baseStyles = 'animate-pulse bg-gray-200';

  const variantStyles: Record<string, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

function SkeletonCard(): ReactElement {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      <Skeleton height={200} className="w-full" />
      <Skeleton height={24} className="w-3/4" />
      <Skeleton height={16} className="w-1/2" />
      <div className="flex gap-2">
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={80} />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard };
export default Skeleton;
