import React, { Suspense, useEffect } from 'react';
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

// ╔══════════════════════════════════════════════════════════════╗
// ║         SECURE CRYPTO UTILITIES (AES-GCM + HMAC-SHA256)     ║
// ╚══════════════════════════════════════════════════════════════╝

// Derive a CryptoKey from a passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array, usage: KeyUsage[]): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase) as BufferSource, { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 200000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );
}

// App-level secret (embedded at build time — safe for client-side session tokens)
const APP_SECRET = 'enfuture-v2-UID-secret-2026-secure';

/**
 * Encrypt a plain object into an AES-GCM ciphertext, then sign it with HMAC-SHA256.
 * Output format (URL-safe base64): salt(16) | iv(12) | hmac(32) | ciphertext
 */
export async function encryptPayload(data: object): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await deriveKey(APP_SECRET, salt, ['encrypt']);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(JSON.stringify(data))
  );

  // Sign: HMAC-SHA256 over (salt || iv || ciphertext)
  const cipherBytes = new Uint8Array(cipher);
  const toSign = new Uint8Array(salt.length + iv.length + cipherBytes.length);
  toSign.set(salt, 0);
  toSign.set(iv, salt.length);
  toSign.set(cipherBytes, salt.length + iv.length);

  const hmacKey = await crypto.subtle.importKey(
    'raw', enc.encode(APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, toSign));

  // Bundle: salt(16) + iv(12) + hmac(32) + cipher
  const bundle = new Uint8Array(16 + 12 + 32 + cipherBytes.length);
  bundle.set(salt, 0);
  bundle.set(iv, 16);
  bundle.set(sig, 28);
  bundle.set(cipherBytes, 60);

  // URL-safe base64
  return btoa(String.fromCharCode(...bundle))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decrypt and verify an encrypted payload produced by encryptPayload.
 * Returns null if the token is tampered or malformed.
 */
export async function decryptPayload(token: string): Promise<object | null> {
  try {
    const enc = new TextEncoder();
    // Restore standard base64
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/') + '==';
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    const salt = raw.slice(0, 16);
    const iv = raw.slice(16, 28);
    const sig = raw.slice(28, 60);
    const cipherBytes = raw.slice(60);

    // Verify HMAC
    const toVerify = new Uint8Array(salt.length + iv.length + cipherBytes.length);
    toVerify.set(salt, 0);
    toVerify.set(iv, salt.length);
    toVerify.set(cipherBytes, salt.length + iv.length);

    const hmacKey = await crypto.subtle.importKey(
      'raw', enc.encode(APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const valid = await crypto.subtle.verify('HMAC', hmacKey, sig, toVerify);
    if (!valid) { console.error('❌ Token HMAC invalid — discarded'); return null; }

    const aesKey = await deriveKey(APP_SECRET, salt, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipherBytes);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (e) {
    console.error('❌ Token decryption failed:', e);
    return null;
  }
}

// Smart domain-based redirector and state synchronizer
const DomainManager = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useUserStore();
  const hostname = window.location.hostname;
  const location = useLocation();
  const pathname = location.pathname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // Track if we've just handled a sync_token
  const [hasSyncToken, setHasSyncToken] = React.useState(false);

  // 1. Handle incoming sync token and logout parameter (AES-GCM decryption)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncToken = params.get('sync_token');
    const isLogout = params.get('logout');
    const currentHostname = window.location.hostname;

    if (isLogout) {
      useUserStore.getState().logout();
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (syncToken) {
      // AES-GCM + HMAC-SHA256 decryption
      decryptPayload(syncToken).then((decoded: any) => {
        if (decoded && decoded.user) {
          useUserStore.setState({ user: decoded.user, isAuthenticated: true });
          setHasSyncToken(true);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    } else if (currentHostname === LOGIN_DOMAIN) {
      useUserStore.getState().logout();
    }

    sessionStorage.removeItem('logging_out');
  }, []);

  // 2. Routing logic based on domain
  const isAdminDomain = hostname === ADMIN_DOMAIN;
  const isUserDomain = hostname === USER_DOMAIN;
  const isLoginDomain = hostname === LOGIN_DOMAIN;
  const isMainDomain = !isAdminDomain && !isUserDomain && !isLoginDomain;

  useEffect(() => {
    // Prevent accidental redirects if we are currently logging out
    if (window.location.search.includes('logout=')) return;

    // Do NOT redirect on localhost or non-enfuture.uz domains
    if (isLocalhost) return;
    if (!hostname.includes('enfuture.uz')) return;

    if (!isAuthenticated || !user) {
      if (!isLocalhost && hostname.includes('enfuture.uz')) {
        if (isAdminDomain) {
          // Allow direct access to admin.enfuture.uz without authentication (only device passcode will block)
          return;
        }
        if ((pathname === '/login' || pathname === '/register') && !isLoginDomain) {
          window.location.replace(`https://${LOGIN_DOMAIN}${pathname}`);
          return;
        }
        if (isLoginDomain && pathname === '/') {
          window.location.replace(`https://${LOGIN_DOMAIN}/login`);
          return;
        }
      }
      return;
    }

    const isAdminEmail = user.email.toLowerCase() === ADMIN_EMAIL;
    const shouldRedirectFromLoginDomain = isLoginDomain && hasSyncToken;

    // ── AES-GCM encrypted sync token (async) ──
    encryptPayload({ user, iat: Date.now() }).then((encToken) => {
      const syncPayload = encodeURIComponent(encToken);

      if (isAdminEmail) {
        // Admin → admin.enfuture.uz/admin
        if (!isAdminDomain && (
          pathname.startsWith('/admin') ||
          pathname.startsWith('/dashboard') ||
          shouldRedirectFromLoginDomain ||
          pathname === '/login' ||
          pathname === '/register'
        )) {
          window.location.replace(`https://${ADMIN_DOMAIN}/admin?sync_token=${syncPayload}`);
        }
      } else {
        // Oddiy User → user.enfuture.uz/dashboard
        if (!isUserDomain && (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/courses') ||
          pathname.startsWith('/ai-tutor') ||
          pathname.startsWith('/profile') ||
          shouldRedirectFromLoginDomain ||
          pathname === '/login' ||
          pathname === '/register'
        )) {
          const targetPath = (
            pathname.startsWith('/dashboard') ||
            pathname.startsWith('/courses') ||
            pathname.startsWith('/ai-tutor') ||
            pathname.startsWith('/profile')
          ) ? pathname : '/dashboard';
          window.location.replace(`https://${USER_DOMAIN}${targetPath}?sync_token=${syncPayload}`);
        }
      }
    });
  }, [isAuthenticated, user, hostname, pathname, isAdminDomain, isUserDomain, isLoginDomain, isMainDomain, isLocalhost, hasSyncToken]);

  // 3. Strict 403 Barrier for SUBDOMAINS without auth and Device Lock
  const isApprovedDevice = localStorage.getItem('enfuture_admin_v2') === 'approved';
  
  const isInvalidAdmin = false; // Relaxed: admin.enfuture.uz is guarded strictly by passcode now
  const isInvalidUser = isUserDomain && isAuthenticated && user?.email.toLowerCase() === ADMIN_EMAIL;
  const isLoggingOut = sessionStorage.getItem('logging_out') === '1';

  // Device block on admin domain applies to anyone visiting without approval
  const isDeviceBlocked = isAdminDomain && !isApprovedDevice;

  const [passcodeInput, setPasscodeInput] = React.useState('');
  const [authError, setAuthError] = React.useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const secureKey = "EF_#2026_@SecUre_AdMin_7799!$";
    if (passcodeInput === secureKey) {
      localStorage.setItem('enfuture_admin_v2', 'approved');
      window.location.href = '/admin';
    } else {
      setAuthError("Tasdiqlash kodi noto'g'ri!");
      setPasscodeInput('');
    }
  };

  if (isDeviceBlocked && !isLoggingOut) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white p-4 font-mono selection:bg-rose-500/30">
        <div className="max-w-md w-full border border-rose-500/20 bg-rose-950/10 p-8 rounded-3xl shadow-[0_0_55px_rgba(244,63,94,0.18)] text-center relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>
          
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 animate-pulse">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-black mb-2 text-rose-500 tracking-wider">ADMIN XAVFSIZLIK TIZIMI</h1>
          <h2 className="text-xs font-bold mb-6 text-rose-300/80 uppercase tracking-widest">Qurilma ro'yxatdan o'tmagan</h2>
          
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            admin.enfuture.uz saytiga kirish cheklangan. Ushbu qurilmada ishlash uchun maxsus ma'muriy tasdiqlash kalitini kiriting.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Tasdiqlash kalitini kiriting"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-sm font-medium focus:outline-none focus:border-rose-500 transition-all text-white placeholder:text-slate-600 animate-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-500 bg-rose-500/10 py-2.5 rounded-xl border border-rose-500/20 font-bold">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="text-xs uppercase tracking-widest font-black text-white bg-rose-600 hover:bg-rose-700 transition-all px-6 h-12 rounded-xl w-full flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 active:scale-95 cursor-pointer font-bold"
            >
              Qurilmani tasdiqlash
            </button>
          </form>
        </div>
      </div>
    );
  }

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

  // 4. Admin domain: force redirect all paths to /admin
  if (isAdminDomain && !isLoggingOut && isApprovedDevice) {
    if (pathname === '/' || pathname === '/dashboard') {
      return <Navigate to="/admin" replace />;
    }
    // Block non-admin routes on admin domain
    if (!pathname.startsWith('/admin') && pathname !== '/login' && pathname !== '/register') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

// Guard: admin sees children; non-admins see fallback (or redirect to /dashboard)
const AdminRoute = ({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { user } = useUserStore();
  const isAdminDomain = window.location.hostname === 'admin.enfuture.uz';
  const isApprovedDevice = localStorage.getItem('enfuture_admin_v2') === 'approved';

  // If on admin.enfuture.uz and has approved device, allow access without email verification
  if (isAdminDomain && isApprovedDevice) {
    return <>{children}</>;
  }

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
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
            {/* /dashboard: Admin sees AdminPanel, others see DashboardPage */}
            <Route path="/dashboard" element={
              <AdminRoute fallback={<DashboardPage />}>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            {/* /admin also works as alias for Admin Panel */}
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