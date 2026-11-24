import { MotionConfig } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, matchPath, Route, Routes, useLocation } from 'react-router-dom';
import InstallPrompt from './components/InstallPrompt';
import SetupScreen from './components/SetupScreen';
import { LoadingScreen } from './components/States';
import UpdatePrompt from './components/UpdatePrompt';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PeriodProvider } from './context/PeriodContext';
import { QuickAddProvider } from './context/QuickAddContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { useIsDesktop } from './hooks/useIsDesktop';
import { LOGIN, NOT_FOUND, ROUTES } from './routes';
import { isConfigured } from './services/firebase';

// Signed-in shells pull in Firestore, so they are fetched only after sign-in.
const DesktopLayout = lazy(() => import('./layouts/DesktopLayout'));
const MobileLayout = lazy(() => import('./layouts/MobileLayout'));

export default function App() {
  if (!isConfigured) return <SetupScreen />;
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <PeriodProvider>
              <QuickAddProvider>
                <BrowserRouter>
                  <Shell />
                </BrowserRouter>
              </QuickAddProvider>
            </PeriodProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </MotionConfig>
  );
}

/** Sets the tab title from the route table: "Stats · Kharcha". */
function useRouteTitle(signedIn) {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = ROUTES.find((r) => matchPath(r.path, pathname));
    const name = route ? (signedIn || route.public ? route.title : 'Sign in') : 'Page not found';
    document.title = route?.path === '/' && signedIn ? 'Kharcha' : `${name} · Kharcha`;
  }, [pathname, signedIn]);
}

/** Picks the component tree. Switching happens live as the window crosses 1024px. */
function Shell() {
  const { user, loading } = useAuth();
  const desktop = useIsDesktop();
  const { pathname } = useLocation();
  useRouteTitle(Boolean(user));

  if (loading) return <LoadingScreen label="Starting Kharcha" />;

  if (!user) {
    // Legal pages are public; everything else shows the sign-in screen.
    const open = ROUTES.find((r) => r.public && matchPath(r.path, pathname));
    const Page = open ? (desktop ? open.desktop : open.mobile) : desktop ? LOGIN.desktop : LOGIN.mobile;
    return (
      <>
        <Suspense fallback={<LoadingScreen />}><Page /></Suspense>
        <InstallPrompt signedIn={false} />
        <UpdatePrompt />
      </>
    );
  }

  const Layout = desktop ? DesktopLayout : MobileLayout;
  const NotFound = desktop ? NOT_FOUND.desktop : NOT_FOUND.mobile;
  return (
    <Suspense fallback={<LoadingScreen />}>
    <Layout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {ROUTES.map(({ path, mobile, desktop: desk }) => {
            const Page = desktop ? desk : mobile;
            return <Route key={path} path={path} element={<Page />} />;
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
    <InstallPrompt signedIn />
    <UpdatePrompt />
    </Suspense>
  );
}
