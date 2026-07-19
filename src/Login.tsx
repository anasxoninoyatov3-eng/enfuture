import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useUserStore } from '@/userStore';
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type Step = 'email' | 'otp';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithEmail, verifyLoginOtp, syncGoogleUser } = useUserStore();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider, db } = await import('@/firebase');
      const { doc, getDoc, setDoc } = await import('firebase/firestore');

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user is blocked
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().isBlocked) {
        setError('Sizning hisobingiz admin tomonidan bloklangan.');
        setIsGoogleLoading(false);
        return;
      }
      
      const userInfo = {
        sub: user.uid,
        email: user.email,
        given_name: user.displayName?.split(' ')[0] || '',
        family_name: user.displayName?.split(' ').slice(1).join(' ') || '',
        picture: user.photoURL,
      };

      syncGoogleUser(userInfo);
      
      // Save minimal info to Firestore for admin usage
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      }, { merge: true });

      navigate('/dashboard');
    } catch (err) {
      console.error('Auth Exception', err);
      setError('Tizimga kirishda xatolik yuz berdi.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    if (step === 'email') {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('To\'g\'ri email manzil kiriting');
        return;
      }
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await loginWithEmail(email.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    
    if (step === 'email') {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('6 xonali OTP kodni kiriting');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = verifyLoginOtp(email, otp);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <img src="/favicon.svg?v=6" alt="Logo" className="h-14 w-14 mx-auto object-contain drop-shadow-xl" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">ENK English</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Ingliz tilini o'rganish platformasi</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Tizimga kirish</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Email manzilingizni kiriting</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Email manzil</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input
                        type="email"
                        placeholder="ali@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/20 px-4 py-2.5 rounded-xl"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Kod yuborish <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">yoki</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => onGoogleLogin()}
                    disabled={isGoogleLoading}
                    className="w-full h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold text-sm flex items-center justify-center gap-3 transition-all"
                  >
                    {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                    {isGoogleLoading ? 'Ulanmoqda...' : 'Google bilan kirish'}
                  </button>

                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Hisobingiz yo'qmi?{' '}
                    <a href="https://login.enfuture.uz/register" className="text-indigo-600 font-bold hover:underline">Ro'yxatdan o'ting</a>
                  </p>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">OTP Kodini kiriting</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span> ga kod yuborildi
            </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">OTP Kodi</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                      className="w-full h-14 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-center text-2xl font-black tracking-widest focus:outline-none focus:border-indigo-600 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/20 px-4 py-2.5 rounded-xl"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <><CheckCircle className="h-5 w-5" /> Kirish</>
                    )}
                  </button>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      {loading ? 'Qayta yuborilmoqda...' : 'Kodni qayta yuborish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                      className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                    >
                      ← Orqaga qaytish
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 font-medium px-4">
          Kirish orqali siz{' '}
          <span className="text-indigo-600 font-bold cursor-pointer">Foydalanish shartlari</span> va{' '}
          <span className="text-indigo-600 font-bold cursor-pointer">Maxfiylik siyosati</span> ga rozilik bildirasiz.
        </p>
      </motion.div>
    </div>
  );
};
