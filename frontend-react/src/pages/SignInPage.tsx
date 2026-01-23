import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { useSignIn, useRegister } from '@/hooks';
import { useAuthStore } from '@/store';
import { registerSchema, type RegisterFormData } from '@/utils';

function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/user/register';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const signInMutation = useSignIn();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    reset();
  }, [isRegister, reset]);

  const onSubmit = async (data: RegisterFormData) => {
    if (isRegister) {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
    } else {
      await signInMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
    }
  };

  const isLoading = signInMutation.isPending || registerMutation.isPending;
  const error = signInMutation.error || registerMutation.error;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isRegister ? 'Create Account' : 'Sign In'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {isRegister && (
                <IonItem>
                  <IonLabel position="stacked">Full Name</IonLabel>
                  <IonInput
                    type="text"
                    {...register('fullName')}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <IonText color="danger">
                      <p className="ion-no-margin ion-padding-top">
                        {errors.fullName.message}
                      </p>
                    </IonText>
                  )}
                </IonItem>
              )}

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <IonText color="danger">
                    <p className="ion-no-margin ion-padding-top">
                      {errors.email.message}
                    </p>
                  </IonText>
                )}
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  {...register('password')}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <IonText color="danger">
                    <p className="ion-no-margin ion-padding-top">
                      {errors.password.message}
                    </p>
                  </IonText>
                )}
              </IonItem>

              {isRegister && (
                <IonItem>
                  <IonLabel position="stacked">Confirm Password</IonLabel>
                  <IonInput
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <IonText color="danger">
                      <p className="ion-no-margin ion-padding-top">
                        {errors.confirmPassword.message}
                      </p>
                    </IonText>
                  )}
                </IonItem>
              )}

              {error && (
                <IonText color="danger">
                  <p className="ion-padding">
                    {error instanceof Error ? error.message : 'An error occurred'}
                  </p>
                </IonText>
              )}

              <div className="ion-padding-top">
                <IonButton expand="block" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <IonSpinner name="crescent" />
                  ) : isRegister ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </IonButton>
              </div>
            </form>

            <div className="ion-text-center ion-padding-top">
              {isRegister ? (
                <p>
                  Already have an account?{' '}
                  <IonButton fill="clear" routerLink="/user/signin">
                    Sign In
                  </IonButton>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <IonButton fill="clear" routerLink="/user/register">
                    Create Account
                  </IonButton>
                </p>
              )}
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}

export default SignInPage;
