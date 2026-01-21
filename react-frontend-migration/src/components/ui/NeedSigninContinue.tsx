import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';

interface NeedSigninContinueProps {
  isModal?: boolean;
  onClose?: () => void;
}

function NeedSigninContinue({
  isModal = false,
  onClose,
}: NeedSigninContinueProps): ReactElement {
  const navigate = useNavigate();

  const handleSignin = (): void => {
    if (isModal && onClose) {
      onClose();
    }
    navigate('/user/signin');
  };

  const handleClose = (): void => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {isModal && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Content Restricted</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>
      )}

      <div className="flex flex-col justify-center items-center flex-1 p-4">
        <div className="text-center px-3 py-4">
          <img
            src="/assets/images/security.svg"
            alt="Security"
            className="max-w-[400px] xl:max-w-[500px] mx-auto"
          />

          <h4 className="sm:text-[20px] font-bold mt-4">
            YOU NEED TO SIGN IN TO CONTINUE
          </h4>

          <Button
            onClick={handleSignin}
            className="w-full max-w-[300px] mt-2 sm:mt-4 md:text-[20px]"
            size="lg"
          >
            SIGN IN
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NeedSigninContinue;
