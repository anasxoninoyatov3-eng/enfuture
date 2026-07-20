import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || '';

if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized with public key');
} else {
  console.warn('EmailJS public key is missing!');
}
import { UserProfile, TopicProgress, KnowledgeLevel } from './types';
import { db } from './firebase';
import { collection, doc, setDoc, addDoc, getDoc } from 'firebase/firestore';

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
  registerWithEmail: (firstName: string, lastName: string, email: string, level: KnowledgeLevel) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOtpAndRegister: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyLoginOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
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

      registerWithEmail: async (firstName, lastName, email, level) => {
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

        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
          try {
            console.log('Sending EmailJS request to:', email);
            const result = await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              {
                to_email: email,
                to_name: `${firstName} ${lastName}`,
                otp_code: otp,
              }
            );
            console.log('📧 Email sent successfully:', result.status, result.text);
          } catch (err: any) {
            console.error('EmailJS error:', err);
            return { success: false, message: `Email yuborishda xatolik: ${err?.text || err?.message || 'Noma\'lum xatolik'}` };
          }
        } else {
          console.warn('EmailJS keys are missing!');
          return { success: false, message: 'Email sozlamalari topilmadi. Admin bilan bog\'laning.' };
        }

        return { success: true, message: 'OTP yuborildi' };
      },

      verifyOtpAndRegister: async (email, otp) => {
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

        // Sync to Firestore details for Admin panel access
        try {
          await setDoc(doc(db, 'users', newUser.id), {
            uid: newUser.id,
            email: newUser.email,
            displayName: `${newUser.firstName} ${newUser.lastName}`,
            photoURL: '',
            lastLogin: newUser.joinDate,
            xp: newUser.xp,
            currentLevel: newUser.currentLevel,
            joinDate: newUser.joinDate,
            isGoogle: false
          });

          await addDoc(collection(db, 'audit_logs'), {
            type: 'register',
            email: newUser.email,
            name: `${newUser.firstName} ${newUser.lastName}`,
            timestamp: newAudit.timestamp
          });
        } catch (err) {
          console.error("Firestore Error in verifyOtpAndRegister:", err);
        }

        set((state) => ({
          allUsers: [...state.allUsers, newUser],
          user: newUser,
          isAuthenticated: true,
          pendingRegistration: null,
          auditLogs: [newAudit, ...state.auditLogs]
        }));

        return { success: true, message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!' };
      },

      loginWithEmail: async (email) => {
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

        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
          try {
            console.log('Sending EmailJS login request to:', email);
            const result = await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              {
                to_email: email,
                to_name: `${existingUser.firstName} ${existingUser.lastName}`,
                otp_code: otp,
              }
            );
            console.log('📧 Login Email sent successfully:', result.status, result.text);
          } catch (err: any) {
            console.error('EmailJS login error:', err);
            return { success: false, message: `Email yuborishda xatolik: ${err?.text || err?.message || 'Noma\'lum xatolik'}` };
          }
        } else {
          console.warn('EmailJS keys are missing!');
          return { success: false, message: 'Email sozlamalari topilmadi. Admin bilan bog\'laning.' };
        }

        return { success: true, message: 'OTP yuborildi' };
      },

      verifyLoginOtp: async (email, otp) => {
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

        // Sync to Firestore for Admin panel access
        try {
          const userRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            await setDoc(userRef, {
              lastLogin: new Date().toISOString()
            }, { merge: true });
          } else {
            await setDoc(userRef, {
              uid: user.id,
              email: user.email,
              displayName: `${user.firstName} ${user.lastName}`,
              photoURL: '',
              lastLogin: new Date().toISOString(),
              xp: user.xp || 0,
              currentLevel: user.currentLevel || 'A1',
              joinDate: user.joinDate || new Date().toISOString(),
              isGoogle: false
            });
          }

          await addDoc(collection(db, 'audit_logs'), {
            type: 'login',
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            timestamp: newAudit.timestamp
          });
        } catch (err) {
          console.error("Firestore Error in verifyLoginOtp:", err);
        }

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
