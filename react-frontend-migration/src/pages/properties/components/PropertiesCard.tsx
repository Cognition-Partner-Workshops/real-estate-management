import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { PropertyBadge } from '@/components/ui';
import Button from '@/components/ui/Button';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertiesCardProps {
  property: Property;
}

function PropertiesCard({ property }: PropertiesCardProps): ReactElement {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);
  const isOwner = user?.user_id === property.user_id;

  const handleSelectProperty = (): void => {
    navigate(`/properties/${property.property_id}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBadgeClass = (): string => {
    if (isOwner) {
      return 'bg-blue-500';
    }
    return property.transactionType === TransactionType.ForRent
      ? 'bg-yellow-500'
      : 'bg-green-500';
  };

  const getBadgeText = (): string => {
    if (isOwner) {
      return 'Owned';
    }
    return `For ${property.transactionType}`;
  };

  return (
    <div className="relative flex flex-col w-full max-w-[360px] h-full bg-white dark:bg-gray-800 rounded-lg shadow-none outline outline-1 outline-slate-200 dark:outline-slate-700 overflow-hidden">
      <div
        className={`z-10 absolute rounded-br-lg py-1 px-3 sm:text-lg font-bold bg-opacity-80 text-white ${getBadgeClass()}`}
      >
        <span className="capitalize">{getBadgeText()}</span>
      </div>

      <div
        className="h-[230px] overflow-hidden cursor-pointer group"
        onClick={handleSelectProperty}
      >
        {!property.images || property.images.length === 0 ? (
          <img
            className="w-full h-full object-cover"
            src="/assets/images/no-image.jpeg"
            alt="No image available"
          />
        ) : (
          <img
            className="w-full h-full object-cover group-hover:scale-125 transition-all ease-in-out duration-300"
            src={property.images[0]}
            alt={property.name}
          />
        )}
      </div>

      <div className="py-2 px-3">
        <PropertyBadge type={property.type} />
        <h3 className="text-base sm:text-xl text-ellipsis line-clamp-1 mt-1 text-gray-900 dark:text-white">
          {property.name}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(property.createdAt)}
        </div>
      </div>

      <div className="flex flex-col px-3 pb-3 flex-grow">
        <div className="line-clamp-3 text-ellipsis overflow-hidden h-[60px] mb-3 text-gray-600 dark:text-gray-300">
          <p className="line-clamp-3 text-ellipsis overflow-hidden">
            {property.description}
          </p>
        </div>

        <div className="font-bold sm:text-lg mt-auto text-gray-900 dark:text-white">
          {formatPrice(property.price)}
          {property.transactionType === TransactionType.ForRent && property.paymentFrequency && (
            <span className="capitalize text-base font-normal ml-1">
              | {property.paymentFrequency}
            </span>
          )}
        </div>

        <Button
          onClick={handleSelectProperty}
          fullWidth
          className="mt-3"
          variant="primary"
        >
          View property
        </Button>
      </div>
    </div>
  );
}

export { PropertiesCard };
export default PropertiesCard;
