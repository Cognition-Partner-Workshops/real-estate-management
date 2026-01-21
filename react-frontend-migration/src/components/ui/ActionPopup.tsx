import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import Button from './Button';

type ActionType = 'message' | 'edit' | 'report' | 'delete';

interface ActionPopupProps {
  showMessage?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showReport?: boolean;
  onAction?: (action: ActionType) => void;
  onClose?: () => void;
}

function ActionPopup({
  showMessage = true,
  showEdit = true,
  showDelete = true,
  showReport = true,
  onAction,
  onClose,
}: ActionPopupProps): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleAction = (action: ActionType): void => {
    if (!isAuthenticated) {
      navigate('/user/signin');
      dispatch(
        addNotification({
          type: 'error',
          message: 'Please sign in to continue',
        })
      );
      onClose?.();
      return;
    }
    onAction?.(action);
  };

  const handleClose = (): void => {
    onClose?.();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-48">
      <div className="font-bold text-sm text-gray-700 dark:text-gray-200 px-2 py-1 mb-1">
        Select Action:
      </div>

      <div className="flex flex-col gap-1">
        {showMessage && (
          <Button
            variant="success"
            fullWidth
            onClick={() => handleAction('message')}
            className="justify-start"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Message
          </Button>
        )}

        {showEdit && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => handleAction('edit')}
            className="justify-start"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </Button>
        )}

        {showReport && (
          <Button
            variant="warning"
            fullWidth
            onClick={() => handleAction('report')}
            className="justify-start"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            Report
          </Button>
        )}

        {showDelete && (
          <Button
            variant="danger"
            fullWidth
            onClick={() => handleAction('delete')}
            className="justify-start"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </Button>
        )}

        <Button variant="ghost" fullWidth onClick={handleClose} className="justify-start">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Close
        </Button>
      </div>
    </div>
  );
}

export default ActionPopup;
