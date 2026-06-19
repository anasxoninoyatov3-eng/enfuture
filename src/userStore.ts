import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, TopicProgress, KnowledgeLevel } from './types';

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  allUsers: UserProfile[];
  login: (userData: Partial<UserProfile>) => void;
  logout: () => void;
  addXp: (amount: number) => void;
  updateTopicProgress: (topic: string, level: KnowledgeLevel, score: number, mastered: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || 'User';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      allUsers: [],
      
      login: (userData) => {
        const { firstName, lastName } = userData.name ? splitFullName(userData.name) : { firstName: 'User', lastName: '' };
        
        const newUser: UserProfile = {
          id: userData.id || Date.now().toString(),
          firstName,
          lastName,
          email: userData.email || '',
          picture: userData.picture,
          xp: userData.xp || 0,
          streak: userData.streak || 0,
          currentLevel: (userData.currentLevel || 'A1') as KnowledgeLevel,
          topicProgress: userData.topicProgress || [],
          joinDate: new Date().toISOString()
        };

        set((state) => {
          // Check if user already exists in allUsers
          const existingUserIndex = state.allUsers.findIndex(u => u.email === newUser.email);
          let updatedAllUsers;
          
          if (existingUserIndex >= 0) {
            updatedAllUsers = [...state.allUsers];
            updatedAllUsers[existingUserIndex] = { ...updatedAllUsers[existingUserIndex], ...newUser };
          } else {
            updatedAllUsers = [...state.allUsers, newUser];
          }
          
          return {
            user: newUser,
            isAuthenticated: true,
            allUsers: updatedAllUsers
          };
        });
      },
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
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
          allUsers: state.allUsers.map(u => u.id === state.user!.id ? updatedUser : u)
        };
      }),
      
      updateProfile: (updates) => set((state) => {
        if (!state.user) return state;
        
        const updatedUser = { ...state.user, ...updates };
        
        return {
          user: updatedUser,
          allUsers: state.allUsers.map(u => u.id === state.user!.id ? updatedUser : u)
        };
      })
    }),
    {
      name: 'user-storage',
    }
  )
);
