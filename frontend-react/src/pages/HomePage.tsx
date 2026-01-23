import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { useAuthStore } from '@/store';

function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Real Estate Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {isAuthenticated
                ? `Welcome back, ${user?.fullName}!`
                : 'Welcome to Real Estate Management'}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Browse properties, manage listings, and connect with property
              owners all in one place.
            </p>
            <div className="ion-margin-top">
              <IonButton routerLink="/properties">Browse Properties</IonButton>
              {!isAuthenticated && (
                <IonButton routerLink="/user/signin" fill="outline">
                  Sign In
                </IonButton>
              )}
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}

export default HomePage;
