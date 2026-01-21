import { useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';

/**
 * Feature flags configuration for restricted mode.
 * In production, these values would come from environment variables.
 */
interface RestrictionConfig {
  restrictedMode: boolean;
  restrictedHeading: string;
  restrictedMessage: string;
}

const RESTRICTION_CONFIG: RestrictionConfig = {
  restrictedMode: import.meta.env.VITE_RESTRICTED_MODE === 'true',
  restrictedHeading: import.meta.env.VITE_RESTRICTED_HEADING || 'Restricted',
  restrictedMessage:
    import.meta.env.VITE_RESTRICTED_MESSAGE || 'This feature is currently disabled in this mode.',
};

interface ShowToastOptions {
  duration?: number;
  message?: string;
  heading?: string;
}

interface ShowAlertOptions {
  message?: string;
  heading?: string;
}

interface UseRestrictionReturn {
  restricted: boolean;
  showToast: (options?: ShowToastOptions) => void;
  showAlert: (options?: ShowAlertOptions) => void;
}

/**
 * Hook for managing access restrictions and displaying restriction notifications.
 *
 * Provides utilities to check if the app is in restricted mode and to show
 * toast notifications or alerts when users attempt restricted actions.
 *
 * @returns Object containing restricted state and notification functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { restricted, showToast, showAlert } = useRestriction();
 *
 *   const handleAction = () => {
 *     if (restricted) {
 *       showToast({ message: 'This action is not available.' });
 *       return;
 *     }
 *     // Perform action
 *   };
 * }
 * ```
 */
export function useRestriction(): UseRestrictionReturn {
  const dispatch = useAppDispatch();

  const showToast = useCallback(
    (options: ShowToastOptions = {}): void => {
      const { message, heading } = options;

      const notificationMessage = `${heading || RESTRICTION_CONFIG.restrictedHeading}: ${
        message || RESTRICTION_CONFIG.restrictedMessage
      }`;

      dispatch(
        addNotification({
          type: 'warning',
          message: notificationMessage,
        })
      );
    },
    [dispatch]
  );

  const showAlert = useCallback((options: ShowAlertOptions = {}): void => {
    const { message, heading } = options;

    const alertHeading = heading || RESTRICTION_CONFIG.restrictedHeading;
    const alertMessage = message || RESTRICTION_CONFIG.restrictedMessage;

    window.alert(`${alertHeading}\n\n${alertMessage}`);
  }, []);

  return {
    restricted: RESTRICTION_CONFIG.restrictedMode,
    showToast,
    showAlert,
  };
}
