import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = (import.meta as any).env.VITE_EMAILJS_SERVICE_ID || 'service_vyu1648';
const EMAILJS_TEMPLATE_ID = (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID || 'template_ifmgq7r';
const EMAILJS_PUBLIC_KEY = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || 'L-9ag-QLYwdFjyL-v';

if (EMAILJS_PUBLIC_KEY) {
  try {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    console.log('EmailJS initialized with public key:', EMAILJS_PUBLIC_KEY);
  } catch (e) {
    console.warn('EmailJS init warning:', e);
  }
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
        const cleanEmail = email.trim().toLowerCase();
        let existing = state.allUsers.find(u => u.email.toLowerCase() === cleanEmail);

        if (!existing) {
          try {
            const { getDocs, query, where, collection } = await import('firebase/firestore');
            const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              const docData = docSnap.data();
              const nameParts = (docData.displayName || '').split(' ');
              existing = {
                id: docSnap.id,
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                email: docData.email || cleanEmail,
                xp: docData.xp || 0,
                streak: docData.streak || 0,
                currentLevel: (docData.currentLevel as KnowledgeLevel) || 'A1',
                topicProgress: docData.topicProgress || [],
                joinDate: docData.joinDate || new Date().toISOString()
              };
            }
          } catch (err) {
            console.warn('Firestore check fail in registerWithEmail:', err);
          }
        }

        if (existing) {
          return { success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' };
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        set({
          pendingRegistration: { firstName: firstName.trim(), lastName: lastName.trim(), email: cleanEmail, level, otp, expiresAt }
        });

        // Log generated OTP clearly in console for easy debugging
        console.log("%c🔐 ENK ENGLISH REGISTRATION OTP CODE: " + otp, "color: #6366f1; font-weight: bold; font-size: 16px;");

        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
          try {
            console.log('Sending EmailJS request to:', cleanEmail, 'Service:', EMAILJS_SERVICE_ID, 'Template:', EMAILJS_TEMPLATE_ID);
            const templateParams = {
              to_email: cleanEmail,
              user_email: cleanEmail,
              email: cleanEmail,
              to_name: `${firstName} ${lastName}`.trim(),
              otp_code: otp
            };
            const result = await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              templateParams,
              { publicKey: EMAILJS_PUBLIC_KEY }
            );
            console.log('📧 Email sent successfully via EmailJS:', result.status, result.text);
            return { success: true, message: 'Tasdiqlash kodi email manzilingizga yuborildi', otp };
          } catch (err: any) {
            console.error('🚨 EmailJS sending failed with error:', err?.status, err?.text || err);
            return { success: true, message: `OTP yuborildi! (Demo OTP: ${otp})`, otp };
          }
        } else {
          console.warn('EmailJS keys are missing from .env file.');
          return { success: true, message: `OTP yuborildi! (Demo OTP: ${otp})`, otp };
        }
      },

      verifyOtpAndRegister: async (email, otp) => {
        const state = get();
        const pending = state.pendingRegistration;
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.trim();

        if (!pending || pending.email.toLowerCase() !== cleanEmail) {
          return { success: false, message: 'Ro\'yxatdan o\'tish ma\'lumotlari topilmadi' };
        }

        if (Date.now() > pending.expiresAt) {
          set({ pendingRegistration: null });
          return { success: false, message: 'OTP muddati o\'tib ketdi, qayta urinib ko\'ring' };
        }

        if (pending.otp !== cleanOtp) {
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
          const { signInAnonymously } = await import('firebase/auth');
          const { auth } = await import('./firebase');
          
          if (!auth.currentUser) {
            try {
              const anonCred = await signInAnonymously(auth);
              if (anonCred.user) {
                newUser.id = anonCred.user.uid;
              }
            } catch (authErr) {
              console.warn("Firebase Anonymous Auth failed during signup (might be disabled in console):", authErr);
            }
          } else {
            newUser.id = auth.currentUser.uid;
          }

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
          allUsers: [...state.allUsers.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase()), newUser],
          user: newUser,
          isAuthenticated: true,
          pendingRegistration: null,
          auditLogs: [newAudit, ...state.auditLogs]
        }));

        return { success: true, message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!' };
      },

      loginWithEmail: async (email) => {
        const state = get();
        const cleanEmail = email.trim().toLowerCase();
        let existingUser = state.allUsers.find(u => u.email.toLowerCase() === cleanEmail);

        if (!existingUser) {
          try {
            console.log('Querying Firestore for existing login email:', cleanEmail);
            const { getDocs, query, where, collection } = await import('firebase/firestore');
            const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              const docData = docSnap.data();
              const nameParts = (docData.displayName || '').split(' ');
              existingUser = {
                id: docSnap.id,
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                email: docData.email || cleanEmail,
                xp: docData.xp || 0,
                streak: docData.streak || 0,
                currentLevel: (docData.currentLevel as KnowledgeLevel) || 'A1',
                topicProgress: docData.topicProgress || [],
                joinDate: docData.joinDate || new Date().toISOString()
              };
              set((prev) => ({
                allUsers: [...prev.allUsers.filter(u => u.email.toLowerCase() !== cleanEmail), existingUser!]
              }));
              console.log('Successfully synced user from Firestore for login:', existingUser);
            }
          } catch (err) {
            console.error('Firestore check fail in loginWithEmail:', err);
          }
        }

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

        // Log generated OTP clearly in console for easy debugging
        console.log("%c🔐 ENK ENGLISH LOGIN OTP CODE: " + otp, "color: #6366f1; font-weight: bold; font-size: 16px;");

        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
          try {
            console.log('Sending EmailJS login request to:', cleanEmail, 'Service:', EMAILJS_SERVICE_ID, 'Template:', EMAILJS_TEMPLATE_ID);
            const templateParams = {
              to_email: cleanEmail,
              user_email: cleanEmail,
              email: cleanEmail,
              to_name: `${existingUser.firstName} ${existingUser.lastName}`.trim(),
              otp_code: otp
            };
            const result = await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              templateParams,
              { publicKey: EMAILJS_PUBLIC_KEY }
            );
            console.log('📧 Login Email sent successfully:', result.status, result.text);
            return { success: true, message: 'Tasdiqlash kodi email manzilingizga yuborildi', otp };
          } catch (err: any) {
            console.error('🚨 EmailJS login sending failed with error:', err?.status, err?.text || err);
            return { success: true, message: `OTP yuborildi! (Demo OTP: ${otp})`, otp };
          }
        } else {
          console.warn('EmailJS keys are missing from .env file.');
          return { success: true, message: `OTP yuborildi! (Demo OTP: ${otp})`, otp };
        }
      },

      verifyLoginOtp: async (email, otp) => {
        const state = get();
        const pending = state.pendingRegistration;
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.trim();

        if (!pending || pending.email.toLowerCase() !== cleanEmail) {
          return { success: false, message: 'Kirish ma\'lumotlari topilmadi' };
        }

        if (Date.now() > pending.expiresAt) {
          set({ pendingRegistration: null });
          return { success: false, message: 'OTP muddati o\'tib ketdi' };
        }

        if (pending.otp.trim() !== cleanOtp) {
          return { success: false, message: 'OTP kodi noto\'g\'ri' };
        }

        let user = state.allUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (!user) {
          user = {
            id: Date.now().toString(),
            firstName: pending.firstName || 'User',
            lastName: pending.lastName || '',
            email: pending.email,
            xp: 0,
            streak: 0,
            currentLevel: pending.level || 'A1',
            topicProgress: [],
            joinDate: new Date().toISOString()
          };
        }

        const newAudit: AuditLog = {
          id: Date.now().toString() + Math.random(),
          type: 'login',
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          timestamp: new Date().toISOString()
        };

        // Sync to Firestore for Admin panel access
        try {
          const { signInAnonymously } = await import('firebase/auth');
          const { auth } = await import('./firebase');
          
          if (!auth.currentUser) {
            try {
              await signInAnonymously(auth);
            } catch (authErr) {
              console.warn("Firebase Anonymous Auth failed during login verification:", authErr);
            }
          }

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
