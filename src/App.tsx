import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
const LOGIN_DOMAIN = 'login.enfuture.uz';

// Smart domain-based redirector and state synchronizer
const DomainManager = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useUserStore();
  const hostname = window.location.hostname;
  const location = useLocation();
  const pathname = location.pathname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // 1. Handle incoming sync token and logout parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncToken = params.get('sync_token');
    const isLogout = params.get('logout');
    const redirectUrl = params.get('redirect');

    if (isLogout) {
      useUserStore.getState().logout();
      if (redirectUrl) {
        window.location.replace(redirectUrl);
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return;
    }

    if (syncToken) {
      try {
        // Safe decoding for base64 with unicode characters
        const base64Str = syncToken;
        const jsonString = decodeURIComponent(escape(atob(base64Str)));
        const decoded = JSON.parse(jsonString);

        if (decoded && decoded.user) {
          useUserStore.setState({ user: decoded.user, isAuthenticated: true });
        }
        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to sync session data:', e);
      }
    }

    // Always clear logging out flag when starting
    sessionStorage.removeItem('logging_out');
  }, []);

  // 2. Routing logic based on domain
  const isAdminDomain = hostname === ADMIN_DOMAIN;
  const isUserDomain = hostname === USER_DOMAIN;
  const isLoginDomain = hostname === LOGIN_DOMAIN;
  const isMainDomain = !isAdminDomain && !isUserDomain && !isLoginDomain;

  useEffect(() => {
    // Faqat haqiqiy enfuture.uz domenlaridan kirsagina redirect qilsin. Vercel (.app) yoki local domenda qotib qolmasligi uchun ehtiyot sharti:
    if (!hostname.includes('enfuture.uz')) return;
    if (isLocalhost) return;

    if (!isAuthenticated || !user) {
      // Login yoki Register ga boshqa domendan kirishsa login.enfuture.uz ga yuboramiz
      if ((pathname === '/login' || pathname === '/register') && !isLoginDomain) {
        window.location.replace(`https://${LOGIN_DOMAIN}${pathname}`);
      }
      // Login domenida shunchaki / bo'lib tursa ham login o'ziga yuboramiz
      else if (isLoginDomain && pathname === '/') {
        window.location.replace(`https://${LOGIN_DOMAIN}/login`);
      }
      return;
    }

    const isAdminEmail = user.email.toLowerCase() === ADMIN_EMAIL;

    // Safe encoding for base64 with unicode and URL-safe characters
    const jsonString = JSON.stringify({ user });
    const base64Str = btoa(unescape(encodeURIComponent(jsonString)));
    const syncPayload = encodeURIComponent(base64Str);

    if (isAdminEmail) {
      // Admin bitta ro'yxatdan o'tdimi yo logindan kirdimi srazu o'zini joyiga uchadi:
      if (!isAdminDomain && (pathname.startsWith('/admin') || isLoginDomain || pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/register')) {
        window.location.replace(`https://${ADMIN_DOMAIN}/admin?sync_token=${syncPayload}`);
      }
    } else {
      // Oddiy User logindan kirdimi o'zining joyiga uchadi:
      if (!isUserDomain && (pathname.startsWith('/dashboard') || pathname.startsWith('/courses') || pathname.startsWith('/ai-tutor') || pathname.startsWith('/profile') || isLoginDomain || pathname === '/login' || pathname === '/register')) {
        const targetPath = (pathname.startsWith('/dashboard') || pathname.startsWith('/courses') || pathname.startsWith('/ai-tutor') || pathname.startsWith('/profile')) ? pathname : '/dashboard';
        window.location.replace(`https://${USER_DOMAIN}${targetPath}?sync_token=${syncPayload}`);
      }
    }
  }, [isAuthenticated, user, hostname, pathname, isAdminDomain, isUserDomain, isLoginDomain, isMainDomain, isLocalhost]);

  // 3. Strict 403 Barrier for SUBDOMAINS without auth
  const isInvalidAdmin = isAdminDomain && (!isAuthenticated || user?.email.toLowerCase() !== ADMIN_EMAIL);
  const isInvalidUser = isUserDomain && (!isAuthenticated || user?.email.toLowerCase() === ADMIN_EMAIL);
  const isLoggingOut = sessionStorage.getItem('logging_out') === '1';

  if ((isInvalidAdmin || isInvalidUser) && !isLoggingOut) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 font-mono selection:bg-rose-500/30">
        <div className="max-w-md w-full border border-rose-500/20 bg-rose-500/5 p-8 rounded-2xl shadow-[0_0_40px_rgba(225,29,72,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
              <span className="text-3xl">🚫</span>
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 text-rose-500 tracking-wider">XATOLIK 403</h1>
          <h2 className="text-xl font-bold mb-4 text-rose-100">KIRISH TAQIQLANGAN</h2>
          <p className="text-sm text-rose-200/60 mb-6 leading-relaxed">
            {isInvalidAdmin
              ? "Sizda ma'murlar serveriga kirish ruxsati yo'q. Qat'iy taqiqlanadi."
              : "Subdomenga to'g'ridan to'g'ri kirish taqiqlangan. Tizim avval asosiy saytdan ro'yxatdan o'tishingizni so'raydi."}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = 'https://www.enfuture.uz'}
              className="text-xs uppercase tracking-widest font-bold text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/10 px-6 py-3 rounded-xl w-full"
            >
              ASOSIY SAHIFA (ENFUTURE.UZ)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Guard: only admin can access /admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  if (user?.email !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// DomainManager component extracts logic that needs useLocation since it must be inside BrowserRouter
const MainWrapper = () => {
  return (
    <DomainManager>
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
    </DomainManager>
  );
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
      <MainWrapper />
    </BrowserRouter>
  );
};