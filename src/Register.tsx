import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, User, ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';
import { useUserStore } from '@/userStore';
import { KnowledgeLevel } from '@/types';

const LEVELS: { value: KnowledgeLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'A1', label: 'A1 – Beginner', desc: 'Ingliz tilini endigina o\'rgana boshladim', emoji: '🌱' },
  { value: 'A2', label: 'A2 – Elementary', desc: 'Asosiy so\'zlarni bilaman', emoji: '📘' },
  { value: 'B1', label: 'B1 – Intermediate', desc: 'Oddiy suhbatlashishim mumkin', emoji: '🚀' },
  { value: 'B2', label: 'B2 – Upper Intermediate', desc: 'Erkin muloqot qila olaman', emoji: '⚡' },
  { value: 'C1', label: 'C1 – Advanced', desc: 'Murakkab mavzularni tushunaman', emoji: '🏆' },
  { value: 'C2', label: 'C2 – Proficiency', desc: 'Ona tilim kabi bilaman', emoji: '👑' },
];

type Step = 'info' | 'otp';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerWithEmail, verifyOtpAndRegister } = useUserStore();

  const [step, setStep] = useState<Step>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel>('A1');
  const [levelOpen, setLevelOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(''); // for demo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedLevelInfo = LEVELS.find(l => l.value === selectedLevel)!;

  const handleSendOtp = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email manzil noto\'g\'ri');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const result = registerWithEmail(firstName.trim(), lastName.trim(), email.trim(), selectedLevel);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.otp) setDevOtp(result.otp); // demo only
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('6 xonali OTP kodni kiriting');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = verifyOtpAndRegister(email, otp);
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
        className="w-full max-w-[460px]"
      >
        {/* Logo */}
        <div className="text-center mb-8 space-y-3">
          <img src="/favicon.svg?v=6" alt="Logo" className="h-14 w-14 mx-auto object-contain drop-shadow-xl" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">ENK English</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Hisobingizni yarating</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Step indicator */}
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {(['info', 'otp'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`flex-1 py-3 text-xs font-bold text-center uppercase tracking-widest transition-all ${
                  step === s
                    ? 'bg-indigo-600 text-white'
                    : i < (['info', 'otp'] as Step[]).indexOf(step)
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                {i + 1}. {s === 'info' ? 'Ma\'lumotlar' : 'Tasdiqlash'}
              </div>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Shaxsiy ma'lumotlar</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ismingiz va emailingizni kiriting</p>
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Ism</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                          type="text"
                          placeholder="Ali"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Familiya</label>
                      <input
                        type="text"
                        placeholder="Valiyev"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input
                        type="email"
                        placeholder="ali@gmail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Level selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Ingliz tili darajangiz</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setLevelOpen(!levelOpen)}
                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium flex items-center justify-between text-slate-900 dark:text-white transition-all hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/50"
                      >
                        <span className="flex items-center gap-2">
                          <span>{selectedLevelInfo.emoji}</span>
                          <span className="font-bold">{selectedLevelInfo.label}</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${levelOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {levelOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
                          >
                            {LEVELS.map(lv => (
                              <button
                                key={lv.value}
                                type="button"
                                onClick={() => { setSelectedLevel(lv.value); setLevelOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${
                                  selectedLevel === lv.value ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                }`}
                              >
                                <span className="text-xl">{lv.emoji}</span>
                                <div>
                                  <div className="text-sm font-bold text-slate-900 dark:text-white">{lv.label}</div>
                                  <div className="text-xs text-slate-400">{lv.desc}</div>
                                </div>
                                {selectedLevel === lv.value && (
                                  <CheckCircle className="ml-auto h-4 w-4 text-indigo-600 shrink-0" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">{selectedLevelInfo.desc}</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-rose-500 font-medium bg-rose-50 dark:bg-rose-900/20 px-4 py-2.5 rounded-xl"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full h-13 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Davom etish <ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Allaqachon hisobingiz bormi?{' '}
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">Kirish</Link>
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
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Emailni tasdiqlang</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span> manziliga 6 xonali kod yuborildi
                    </p>
                    {devOtp && (
                      <div className="mt-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                          🔧 Demo rejimi — OTP: <span className="font-black text-amber-800 dark:text-amber-300 text-base">{devOtp}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* OTP inputs */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">OTP Kodi</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                      <><CheckCircle className="h-5 w-5" /> Tasdiqlash</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('info'); setError(''); setOtp(''); }}
                    className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                  >
                    ← Orqaga qaytish
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 font-medium px-4">
          Davom etish orqali siz bizning{' '}
          <span className="text-indigo-600 font-bold cursor-pointer">Foydalanish shartlari</span> va{' '}
          <span className="text-indigo-600 font-bold cursor-pointer">Maxfiylik siyosati</span> ga rozilik bildirasiz.
        </p>
      </motion.div>
    </div>
  );
};
