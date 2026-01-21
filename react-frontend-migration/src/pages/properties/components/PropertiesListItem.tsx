import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { PropertyBadge } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import ActionPopup from '@/components/ui/ActionPopup';
import { addNotification } from '@/store/slices/uiSlice';
import { deletePropertyThunk } from '@/store/slices/propertiesSlice';
import type { Property } from '@/types';
import { TransactionType } from '@/types';

interface PropertiesListItemProps {
  property: Property;
  enableOwnedBadge?: boolean;
  enablePopupOptions?: boolean;
}

function PropertiesListItem({
  property,
  enableOwnedBadge = true,
  enablePopupOptions = false,
}: PropertiesListItemProps): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const isOwner = user?.user_id === property.user_id;
  const [showPopup, setShowPopup] = useState(false);

  const handleSelectProperty = (): void => {
    navigate(`/properties/${property.property_id}`);
  };

  const handleOpenPopup = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleClosePopup = (): void => {
    setShowPopup(false);
  };

  const handleAction = async (action: string): Promise<void> => {
    setShowPopup(false);

    if (action === 'delete') {
      try {
        await dispatch(deletePropertyThunk(property.property_id)).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: 'Property deleted successfully',
          })
        );
        navigate('/properties');
      } catch {
        dispatch(
          addNotification({
            type: 'error',
            message: 'Failed to delete property',
          })
        );
      }
    }

    if (action === 'report') {
      dispatch(
        addNotification({
          type: 'success',
          message: 'Success, we will take a look at this property.',
        })
      );
    }
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

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div
      onClick={handleSelectProperty}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-none border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex gap-x-2 items-center flex-wrap">
          {enableOwnedBadge && isOwner && (
            <Badge variant="primary" className="h-5">
              Owned
            </Badge>
          )}
          <PropertyBadge type={property.type} />
          <span className="text-gray-400">|</span>
          <Badge
            variant={property.transactionType === TransactionType.ForSale ? 'success' : 'warning'}
            className="h-5"
          >
            For {property.transactionType}
          </Badge>

          <span className={`ml-auto text-sm text-gray-500 dark:text-gray-400 ${isOwner ? 'mr-9' : ''}`}>
            {formatDate(property.createdAt)}
          </span>

          {isOwner && enablePopupOptions && (
            <div className="relative">
              <button
                onClick={handleOpenPopup}
                className="bg-gray-300 dark:bg-gray-600 w-8 h-8 duration-300 ease-in-out transition-colors hover:bg-gray-400 dark:hover:bg-gray-500 absolute rounded-full p-2 -top-2 right-0 flex justify-center items-center"
              >
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>

              {showPopup && (
                <div className="absolute right-0 top-8 z-50">
                  <ActionPopup
                    showMessage={false}
                    showEdit={false}
                    showReport={false}
                    showDelete={true}
                    onAction={handleAction}
                    onClose={handleClosePopup}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center text-sm lg:mt-2 text-gray-900 dark:text-white">
          <span className="text-base lg:text-lg font-light">
            {truncateText(property.name, 30)}
          </span>
          <span className="px-2 text-gray-400">|</span>
          <span className="hidden md:block md:text-lg font-light text-gray-600 dark:text-gray-300">
            {truncateText(property.description, 40)}
          </span>

          <span className="ml-auto md:text-lg xl:text-xl font-light">
            {formatPrice(property.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

export { PropertiesListItem };
export default PropertiesListItem;
