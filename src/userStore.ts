import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, TopicProgress, KnowledgeLevel } from './types';

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  allUsers: (UserProfile & { password?: string })[];
  syncGoogleUser: (userInfo: any) => void;
  logout: () => void;
  addXp: (amount: number) => void;
  updateTopicProgress: (topic: string, level: KnowledgeLevel, score: number, mastered: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearAllUsers: () => void;
}


export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      allUsers: [],

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
            // Update existing user
            updatedUser = {
              ...state.allUsers[existingUserIndex],
              firstName,
              lastName,
              picture
            };
            updatedAllUsers[existingUserIndex] = updatedUser;
          } else {
            // Create new user
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
