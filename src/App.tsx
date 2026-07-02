import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/Home';
import { DashboardLayout } from '@/DashboardLayout';
import { DashboardPage } from '@/Dashboard';
import { AuthLayout } from '@/AuthLayout';
import { LoginPage } from '@/Login';
import { RegisterPage } from '@/Register';
import { AITutorPage } from '@/AITutor';
import { CoursesPage } from '@/Courses';
import { LeaderboardPage } from '@/Leaderboard';
import { AdminPanel } from '@/AdminPanel';
import { ProfilePage } from '@/Profile';
import { useUiStore } from '@/uiStore';
import { useUserStore } from '@/userStore';

const ADMIN_EMAIL = 'dinoyatova21@gmail.com';
const ADMIN_DOMAIN = 'admin.enfuture.uz';
const USER_DOMAIN = 'user.enfuture.uz';

// Smart domain-based redirector
const DomainRedirect = () => {
  const { user, isAuthenticated } = useUserStore();
  const hostname = window.location.hostname;

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const isAdminEmail = user.email.toLowerCase() === ADMIN_EMAIL;
    const isOnAdminDomain = hostname === ADMIN_DOMAIN;
    const isOnUserDomain = hostname === USER_DOMAIN;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    // Skip redirect on localhost (dev mode)
    if (isLocalhost) return;

    if (isAdminEmail && !isOnAdminDomain) {
      // Admin on wrong domain → redirect to admin domain
      window.location.href = `https://${ADMIN_DOMAIN}/admin`;
    } else if (!isAdminEmail && !isOnUserDomain) {
      // Regular user on wrong domain → redirect to user domain
      window.location.href = `https://${USER_DOMAIN}/dashboard`;
    }
  }, [isAuthenticated, user, hostname]);

  return null;
};

// Guard: only admin can access /admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App = () => {
  const isDarkMode = useUiStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <DomainRedirect />
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[var(--background)]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
