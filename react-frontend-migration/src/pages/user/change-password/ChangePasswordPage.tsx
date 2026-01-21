import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useChangePassword, useLogout } from '@/hooks/useAuth';
import { useRestriction } from '@/hooks/useRestriction';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { Button, Input, Card } from '@/components/ui';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordValidation {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSpecialChar: boolean;
}

const PASSWORD_REGEX = {
  number: /\d/,
  upperCase: /[A-Z]/,
  lowerCase: /[a-z]/,
  specialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

function validatePasswordStrength(password: string): PasswordValidation {
  return {
    hasMinLength: password.length >= 8,
    hasNumber: PASSWORD_REGEX.number.test(password),
    hasUpperCase: PASSWORD_REGEX.upperCase.test(password),
    hasLowerCase: PASSWORD_REGEX.lowerCase.test(password),
    hasSpecialChar: PASSWORD_REGEX.specialChar.test(password),
  };
}

function ChangePasswordPage(): ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { restricted, showAlert } = useRestriction();
  const changePasswordMutation = useChangePassword();
  const logout = useLogout();
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasNumber: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSpecialChar: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setPasswordValidation(validatePasswordStrength(value));
  };

  const onSubmit = async (data: ChangePasswordFormData): Promise<void> => {
    if (restricted) {
      showAlert();
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      dispatch(
        addNotification({
          type: 'success',
          message: 'Password changed successfully. Please sign in again.',
        })
      );

      reset();
      logout();
      navigate('/user/signin', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      dispatch(
        addNotification({
          type: 'error',
          message: errorMessage,
        })
      );
    }
  };

  const isPasswordValid =
    passwordValidation.hasMinLength &&
    passwordValidation.hasNumber &&
    passwordValidation.hasUpperCase &&
    passwordValidation.hasLowerCase &&
    passwordValidation.hasSpecialChar;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md border border-slate-200">
        <Card.Header className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/assets/images/logo.png" alt="logo" className="h-16" />
          </div>
        </Card.Header>

        <Card.Body>
          <h1 className="text-2xl font-bold text-center mb-2">Change Password</h1>
          <p className="text-gray-600 text-center mb-6">
            Your new password must be different from your previous password
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              error={errors.currentPassword?.message}
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
            />

            <Input
              type="password"
              label="New Password"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                validate: {
                  hasNumber: (value) =>
                    PASSWORD_REGEX.number.test(value) || 'Password must contain a number',
                  hasUpperCase: (value) =>
                    PASSWORD_REGEX.upperCase.test(value) ||
                    'Password must contain an uppercase letter',
                  hasLowerCase: (value) =>
                    PASSWORD_REGEX.lowerCase.test(value) ||
                    'Password must contain a lowercase letter',
                  hasSpecialChar: (value) =>
                    PASSWORD_REGEX.specialChar.test(value) ||
                    'Password must contain a special character',
                },
                onChange: handleNewPasswordChange,
              })}
            />

            <Input
              type="password"
              label="Confirm Password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
            />

            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
              <ul className="text-sm space-y-1">
                <li
                  className={
                    passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-500'
                  }
                >
                  {passwordValidation.hasMinLength ? '\u2713' : '\u2022'} At least 8 characters
                </li>
                <li
                  className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}
                >
                  {passwordValidation.hasNumber ? '\u2713' : '\u2022'} Contains a number
                </li>
                <li
                  className={
                    passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'
                  }
                >
                  {passwordValidation.hasUpperCase ? '\u2713' : '\u2022'} Contains an uppercase
                  letter
                </li>
                <li
                  className={
                    passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'
                  }
                >
                  {passwordValidation.hasLowerCase ? '\u2713' : '\u2022'} Contains a lowercase
                  letter
                </li>
                <li
                  className={
                    passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'
                  }
                >
                  {passwordValidation.hasSpecialChar ? '\u2713' : '\u2022'} Contains a special
                  character
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting || changePasswordMutation.isPending}
              disabled={!isPasswordValid}
              className="mt-6"
            >
              Submit
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ChangePasswordPage;
