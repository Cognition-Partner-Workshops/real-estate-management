import { useState, useMemo, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { EnquiryBadge, Badge } from '@/components/ui/Badge';
import ActionPopup from '@/components/ui/ActionPopup';
import { useRestriction } from '@/hooks/useRestriction';
import { deleteEnquiry } from '@/store/slices/enquiriesSlice';
import { addNotification } from '@/store/slices/uiSlice';
import type { Enquiry } from '@/types';

interface EnquiriesListItemProps {
  enquiry: Enquiry;
  onClick?: () => void;
}

function EnquiriesListItem({ enquiry, onClick }: EnquiriesListItemProps): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.user_id);
  const { restricted, showAlert } = useRestriction();
  const [showActionPopup, setShowActionPopup] = useState(false);

  const isSent = useMemo((): boolean => {
    return currentUserId === enquiry.users.from.user_id;
  }, [currentUserId, enquiry.users.from.user_id]);

  const formattedDate = useMemo((): string => {
    if (!enquiry.createdAt) {
      return '';
    }
    return new Date(enquiry.createdAt).toLocaleDateString();
  }, [enquiry.createdAt]);

  const handleActionClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    setShowActionPopup(true);
  };

  const handleClosePopup = (): void => {
    setShowActionPopup(false);
  };

  const handleAction = (action: string): void => {
    setShowActionPopup(false);

    if (action === 'delete') {
      handleDelete();
    }

    if (action === 'message') {
      handleReply();
    }
  };

  const handleDelete = (): void => {
    if (restricted) {
      showAlert();
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this Enquiry?');
    if (confirmed) {
      dispatch(deleteEnquiry(enquiry.enquiry_id))
        .unwrap()
        .then(() => {
          dispatch(
            addNotification({
              type: 'success',
              message: 'Enquiry deleted successfully',
            })
          );
        })
        .catch((error: string) => {
          dispatch(
            addNotification({
              type: 'error',
              message: error || 'Error: Something went wrong, please try again later.',
            })
          );
        });
    }
  };

  const handleReply = (): void => {
    navigate(`/enquiries/${enquiry.enquiry_id}`, {
      state: { openReply: true },
    });
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="capitalize border border-slate-200 dark:border-slate-800"
          >
            {isSent ? 'sent' : 'received'}
          </Badge>

          {!isSent && !enquiry.read && (
            <Badge variant="default" className="bg-gray-200 text-gray-600">
              Unread
            </Badge>
          )}
        </div>

        <div className="relative">
          <button
            onClick={handleActionClick}
            className="bg-gray-300 dark:bg-gray-600 rounded-full w-8 h-8 xl:w-10 xl:h-10 p-2 flex justify-center items-center hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-800 dark:text-gray-200"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>

          {showActionPopup && (
            <div className="absolute right-0 top-full mt-1 z-50">
              <ActionPopup
                showEdit={false}
                showReport={!isSent}
                showMessage={!isSent}
                onAction={handleAction}
                onClose={handleClosePopup}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 lg:px-5 lg:pb-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center">
          <div className="lg:col-span-4 text-base font-medium text-gray-800 dark:text-gray-200">
            {enquiry.title || 'None'}
          </div>

          <div className="lg:col-span-2">
            <EnquiryBadge topic={enquiry.topic} />
          </div>

          <div className="lg:col-span-4 lg:text-center text-gray-600 dark:text-gray-400">
            {enquiry.users.from.email}
          </div>

          <div className="lg:col-span-2 text-gray-600 dark:text-gray-400">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnquiriesListItem;
