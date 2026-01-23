import { useEffect } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/store';
import { useWebSocket } from '@/hooks';

import HomePage from '@/pages/HomePage';
import PropertiesPage from '@/pages/PropertiesPage';
import SignInPage from '@/pages/SignInPage';

setupIonicReact();

function AppContent() {
  const theme = useUIStore((state) => state.theme);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useWebSocket();

  useEffect(() => {
    document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/user/signin" element={<SignInPage />} />
      <Route path="/user/register" element={<SignInPage />} />
      {!isAuthenticated && (
        <Route path="/user/*" element={<Navigate to="/user/signin" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <IonApp>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </IonApp>
  );
}

export default App;
