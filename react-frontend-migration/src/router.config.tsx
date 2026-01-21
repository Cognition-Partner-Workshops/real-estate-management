/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ReactElement } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import Layout from '@/components/Layout';

const MapPage = lazy(() => import('@/pages/map/MapPage'));
const PropertiesPage = lazy(() => import('@/pages/properties/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('@/pages/properties/PropertyDetailPage'));
const EnquiriesPage = lazy(() => import('@/pages/enquiries/EnquiriesPage'));
const MortgageCalcPage = lazy(() => import('@/pages/mortgage-calc/MortgageCalcPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const UserPage = lazy(() => import('@/pages/user/UserPage'));
const SignInPage = lazy(() => import('@/pages/user/auth/SignInPage'));
const RegisterPage = lazy(() => import('@/pages/user/auth/RegisterPage'));
const AboutPage = lazy(() => import('@/pages/about/AboutPage'));

function PageLoader(): ReactElement {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

function LazyMapPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <MapPage />
    </Suspense>
  );
}

function LazyPropertiesPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <PropertiesPage />
    </Suspense>
  );
}

function LazyPropertyDetailPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <PropertyDetailPage />
    </Suspense>
  );
}

function LazyEnquiriesPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <EnquiriesPage />
    </Suspense>
  );
}

function LazyMortgageCalcPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <MortgageCalcPage />
    </Suspense>
  );
}

function LazySettingsPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsPage />
    </Suspense>
  );
}

function LazyUserPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <UserPage />
    </Suspense>
  );
}

function LazySignInPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInPage />
    </Suspense>
  );
}

function LazyRegisterPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterPage />
    </Suspense>
  );
}

function LazyAboutPage(): ReactElement {
  return (
    <Suspense fallback={<PageLoader />}>
      <AboutPage />
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/map" replace />,
      },
      {
        path: 'map',
        element: <LazyMapPage />,
      },
      {
        path: 'properties',
        element: <LazyPropertiesPage />,
      },
      {
        path: 'properties/:id',
        element: <LazyPropertyDetailPage />,
      },
      {
        path: 'enquiries',
        element: <LazyEnquiriesPage />,
      },
      {
        path: 'mortgage-calc',
        element: <LazyMortgageCalcPage />,
      },
      {
        path: 'settings',
        element: <LazySettingsPage />,
      },
      {
        path: 'user',
        element: <LazyUserPage />,
      },
      {
        path: 'user/signin',
        element: <LazySignInPage />,
      },
      {
        path: 'user/register',
        element: <LazyRegisterPage />,
      },
      {
        path: 'about',
        element: <LazyAboutPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
