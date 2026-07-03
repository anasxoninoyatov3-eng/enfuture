import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, TopicProgress, KnowledgeLevel } from './types';

interface PendingRegistration {
  firstName: string;
  lastName: string;
  email: string;
  level: KnowledgeLevel;
  otp: string;
  expiresAt: number;
}

interface AuditLog {
  id: string;
  type: 'login' | 'register';
  email: string;
  name: string;
  timestamp: string;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  allUsers: (UserProfile & { password?: string })[];
  pendingRegistration: PendingRegistration | null;
  auditLogs: AuditLog[];


  // Auth
  syncGoogleUser: (userInfo: any) => void;
  registerWithEmail: (firstName: string, lastName: string, email: string, level: KnowledgeLevel) => { success: boolean; message: string; otp?: string };
  verifyOtpAndRegister: (email: string, otp: string) => { success: boolean; message: string };
  loginWithEmail: (email: string) => { success: boolean; message: string; otp?: string };
  verifyLoginOtp: (email: string, otp: string) => { success: boolean; message: string };
  logout: () => void;

  // Progress
  addXp: (amount: number) => void;
  updateTopicProgress: (topic: string, level: KnowledgeLevel, score: number, mastered: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearAllUsers: () => void;
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const STORAGE_KEY = 'user-storage';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      allUsers: [],
      pendingRegistration: null,
      auditLogs: [],


      syncGoogleUser: (userInfo) => {
        set((state) => {
          const email = userInfo.email.toLowerCase();
          const existingUserIndex = state.allUsers.findIndex(u => u.email.toLowerCase() === email);

          const firstName = userInfo.given_name || userInfo.name || 'User';
          const lastName = userInfo.family_name || '';
          const picture = userInfo.picture;

          let updatedAllUsers = [...state.allUsers];
          let updatedUser;

          if (existingUserIndex >= 0) {
            updatedUser = {
              ...state.allUsers[existingUserIndex],
              firstName,
              lastName,
              picture
            };
            updatedAllUsers[existingUserIndex] = updatedUser;
          } else {
            updatedUser = {
              id: userInfo.sub || Date.now().toString(),
              firstName,
              lastName,
              email: userInfo.email,
              picture,
              xp: 0,
              streak: 0,
              currentLevel: 'A1' as KnowledgeLevel,
              topicProgress: [],
              joinDate: new Date().toISOString()
            };
            updatedAllUsers.push(updatedUser);
          }

          return {
            allUsers: updatedAllUsers,
            user: updatedUser,
            isAuthenticated: true
          };
        });
      },

      registerWithEmail: (firstName, lastName, email, level) => {
        const state = get();
        const existing = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return { success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' };
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        set({
          pendingRegistration: { firstName, lastName, email, level, otp, expiresAt }
        });

        // Real API logic to send OTP to the user's email using EmailJS
        const serviceId = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID;
        const templateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY;

        console.log('EmailJS env vars:', {
          serviceId: serviceId ? 'set' : 'NOT SET',
          templateId: templateId ? 'set' : 'NOT SET',
          publicKey: publicKey ? 'set' : 'NOT SET'
        });

        if (serviceId && templateId && publicKey) {
          console.log('Sending EmailJS request...');
          fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: publicKey,
              template_params: {
                to_email: email,
                to_name: `${firstName} ${lastName}`,
                otp_code: otp,
                message: `Sizning tasdiqlash kodingiz (OTP): ${otp}`
              }
            })
          }).then(async res => {
            console.log('EmailJS response status:', res.status, res.statusText);
            if (res.ok) {
              console.log(`📧 Email sent successfully to ${email}`);
            } else {
              const text = await res.text();
              console.error("EmailJS Error response:", text);
            }
          }).catch(err => {
            console.error("EmailJS network error:", err);
          });
        } else {
          console.warn('EmailJS keys are missing in .env file! Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY');
        }

        console.log(`📧 OTP for ${email}: ${otp}`); // For dev/demo
        return { success: true, message: 'OTP yuborildi', otp };
      },

      verifyOtpAndRegister: (email, otp) => {
        const state = get();
        const pending = state.pendingRegistration;

        if (!pending || pending.email.toLowerCase() !== email.toLowerCase()) {
          return { success: false, message: 'Ro\'yxatdan o\'tish ma\'lumotlari topilmadi' };
        }

        if (Date.now() > pending.expiresAt) {
          set({ pendingRegistration: null });
          return { success: false, message: 'OTP muddati o\'tib ketdi, qayta urinib ko\'ring' };
        }

        if (pending.otp !== otp) {
          return { success: false, message: 'OTP kodi noto\'g\'ri' };
        }

        const newUser: UserProfile = {
          id: Date.now().toString(),
          firstName: pending.firstName,
          lastName: pending.lastName,
          email: pending.email,
          xp: 0,
          streak: 0,
          currentLevel: pending.level,
          topicProgress: [],
          joinDate: new Date().toISOString()
        };

        const newAudit: AuditLog = {
          id: Date.now().toString() + Math.random(),
          type: 'register',
          email: pending.email,
          name: `${pending.firstName} ${pending.lastName}`,
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          allUsers: [...state.allUsers, newUser],
          user: newUser,
          isAuthenticated: true,
          pendingRegistration: null,
          auditLogs: [newAudit, ...state.auditLogs]
        }));

        return { success: true, message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!' };
      },

      loginWithEmail: (email) => {
        const state = get();
        const existingUser = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!existingUser) {
          return { success: false, message: 'Bu email bilan ro\'yxatdan o\'tilmagan' };
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        set({
          pendingRegistration: {
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
            level: existingUser.currentLevel,
            otp,
            expiresAt
          }
        });

        const serviceId = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID;
        const templateId = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY;

        console.log('EmailJS env vars (login):', {
          serviceId: serviceId ? 'set' : 'NOT SET',
          templateId: templateId ? 'set' : 'NOT SET',
          publicKey: publicKey ? 'set' : 'NOT SET'
        });

        if (serviceId && templateId && publicKey) {
          console.log('Sending EmailJS login request...');
          fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: publicKey,
              template_params: {
                to_email: email,
                to_name: `${existingUser.firstName} ${existingUser.lastName}`,
                otp_code: otp,
                message: `Sizning tizimga kirish kodingiz (OTP): ${otp}`
              }
            })
          }).then(async res => {
            console.log('EmailJS login response status:', res.status, res.statusText);
            if (res.ok) {
              console.log(`📧 Login Email sent successfully to ${email}`);
            } else {
              const text = await res.text();
              console.error("EmailJS login Error response:", text);
            }
          }).catch(err => {
            console.error("EmailJS login network error:", err);
          });
        }

        console.log(`📧 Login OTP for ${email}: ${otp}`);
        return { success: true, message: 'OTP yuborildi', otp };
      },

      verifyLoginOtp: (email, otp) => {
        const state = get();
        const pending = state.pendingRegistration;

        if (!pending || pending.email.toLowerCase() !== email.toLowerCase()) {
          return { success: false, message: 'Kirish ma\'lumotlari topilmadi' };
        }

        if (Date.now() > pending.expiresAt) {
          set({ pendingRegistration: null });
          return { success: false, message: 'OTP muddati o\'tib ketdi' };
        }

        if (pending.otp !== otp) {
          return { success: false, message: 'OTP kodi noto\'g\'ri' };
        }

        const user = state.allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { success: false, message: 'Foydalanuvchi topilmadi' };

        const newAudit: AuditLog = {
          id: Date.now().toString() + Math.random(),
          type: 'login',
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          user,
          isAuthenticated: true,
          pendingRegistration: null,
          auditLogs: [newAudit, ...state.auditLogs]
        }));
        return { success: true, message: 'Muvaffaqiyatli kirdingiz!' };
      },

      logout: () => {
        // Clear localStorage to ensure persisted state is removed
        localStorage.removeItem(STORAGE_KEY);
        set({ user: null, isAuthenticated: false, pendingRegistration: null });
      },

      clearAllUsers: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ allUsers: [], user: null, isAuthenticated: false, pendingRegistration: null });
      },

      addXp: (amount) => set((state) => ({
        user: state.user ? { ...state.user, xp: state.user.xp + amount } : null,
        allUsers: state.user ? state.allUsers.map(u =>
          u.id === state.user!.id ? { ...u, xp: u.xp + amount } : u
        ) : state.allUsers
      })),

      updateTopicProgress: (topic, level, score, mastered) => set((state) => {
        if (!state.user) return state;

        const newProgress: TopicProgress = {
          topic,
          level,
          mastered,
          lastStudied: new Date().toISOString(),
          testScore: score,
          attempts: 1
        };

        const existingProgressIndex = state.user.topicProgress.findIndex(
          p => p.topic === topic && p.level === level
        );

        let updatedTopicProgress;
        if (existingProgressIndex >= 0) {
          updatedTopicProgress = [...state.user.topicProgress];
          const existing = updatedTopicProgress[existingProgressIndex];
          updatedTopicProgress[existingProgressIndex] = {
            ...existing,
            mastered: mastered || existing.mastered,
            lastStudied: new Date().toISOString(),
            testScore: Math.max(existing.testScore || 0, score),
            attempts: existing.attempts + 1
          };
        } else {
          updatedTopicProgress = [...state.user.topicProgress, newProgress];
        }

        const updatedUser = { ...state.user, topicProgress: updatedTopicProgress };

        return {
          user: updatedUser,
          allUsers: state.allUsers.map(u => u.id === state.user!.id ? { ...u, ...updatedUser } : u)
        };
      }),

      updateProfile: (updates) => set((state) => {
        if (!state.user) return state;

        const updatedUser = { ...state.user, ...updates };

        return {
          user: updatedUser,
          allUsers: state.allUsers.map(u => u.id === state.user!.id ? { ...u, ...updatedUser } : u)
        };
      })
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
