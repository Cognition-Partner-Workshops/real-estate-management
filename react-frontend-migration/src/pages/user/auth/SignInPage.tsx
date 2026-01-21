import { useState, type ReactElement, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '@/hooks';
import { Button, Input, Card, AlertCard, Footer } from '@/components/ui';

interface FormErrors {
  email?: string;
  password?: string;
}

function SignInPage(): ReactElement {
  const navigate = useNavigate();
  const signInMutation = useSignIn();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email is not valid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    signInMutation.mutate(
      { email, password },
      {
        onSuccess: (response) => {
          if (response.data) {
            navigate('/map', { replace: true });
          } else if (response.error) {
            setSubmitError(response.error);
          }
        },
        onError: () => {
          setSubmitError('Wrong Email or Password.');
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
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Input
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="Enter your password"
                />
              </div>

              {submitError && (
                <AlertCard variant="danger" content={submitError} />
              )}

              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={signInMutation.isPending}
              >
                Sign In
              </Button>

              <div className="text-center text-gray-600 mt-4">
                First time here?{' '}
                <Link
                  to="/user/register"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Register
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

export default SignInPage;
