import React, { Suspense, useEffect } from 'react';
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

// Simple auth state manager — no subdomain redirects
const DomainManager = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Handle ?logout= param
    const params = new URLSearchParams(window.location.search);
    const isLogout = params.get('logout');
    if (isLogout) {
      useUserStore.getState().logout();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    sessionStorage.removeItem('logging_out');
  }, []);

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