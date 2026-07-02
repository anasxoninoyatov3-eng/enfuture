import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, TopicProgress, KnowledgeLevel } from './types';

interface PendingRegistration {
  firstName: string;
  lastName: string;
  email: string;
  level: KnowledgeLevel;
  otp: string;
  expiresAt: number;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  allUsers: (UserProfile & { password?: string })[];
  pendingRegistration: PendingRegistration | null;

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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      allUsers: [],
      pendingRegistration: null,

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

        set((state) => ({
          allUsers: [...state.allUsers, newUser],
          user: newUser,
          isAuthenticated: true,
          pendingRegistration: null
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

        set({ user, isAuthenticated: true, pendingRegistration: null });
        return { success: true, message: 'Muvaffaqiyatli kirdingiz!' };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      clearAllUsers: () => set({ allUsers: [], user: null, isAuthenticated: false }),

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
      name: 'user-storage',
    }
  )
);
