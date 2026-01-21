import { useState, type ReactElement, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/hooks';
import { Button, Input, Card, AlertCard, Footer } from '@/components/ui';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasNumber: /\d/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

function RegisterPage(): ReactElement {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.length < 4) {
      newErrors.fullName = 'Full Name is too short (minimum 4 characters)';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is not valid. ex: name@email.com';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors: string[] = [];
      if (formData.password.length < PASSWORD_REQUIREMENTS.minLength) {
        passwordErrors.push('at least 8 characters');
      }
      if (!PASSWORD_REQUIREMENTS.hasNumber.test(formData.password)) {
        passwordErrors.push('a number');
      }
      if (!PASSWORD_REQUIREMENTS.hasUpperCase.test(formData.password)) {
        passwordErrors.push('an uppercase letter');
      }
      if (!PASSWORD_REQUIREMENTS.hasLowerCase.test(formData.password)) {
        passwordErrors.push('a lowercase letter');
      }
      if (!PASSWORD_REQUIREMENTS.hasSpecialChar.test(formData.password)) {
        passwordErrors.push('a special character');
      }
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate(
      {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: (response) => {
          if (response.data) {
            navigate('/user', { replace: true });
          } else if (response.error) {
            setSubmitError(response.error);
          }
        },
        onError: (error) => {
          setSubmitError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Card.Header className="text-center border-b-0">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/images/logo.png"
                alt="logo"
                className="h-16 w-auto"
              />
            </div>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  error={errors.fullName}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Input
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={errors.email}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Input
                  type="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={errors.password}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <Input
                  type="password"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                />
              </div>

              <div className="text-sm text-gray-600 py-2">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  User Agreement
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </div>

              {submitError && (
                <AlertCard variant="danger" content={submitError} />
              )}

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={registerMutation.isPending}
              >
                Sign Up
              </Button>

              <div className="text-center text-gray-600 mt-4">
                Already have an Account?{' '}
                <Link
                  to="/user/signin"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;
