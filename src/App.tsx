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
