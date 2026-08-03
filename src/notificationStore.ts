import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'lesson_reminder' | 'schedule_alert' | 'achievement' | 'quiz_alert';
  read: boolean;
  actionUrl?: string;
}

export interface ScheduleItem {
  id: string;
  day: string; // 'Dushanba' | 'Seshanba' | 'Chorshanba' | 'Payshanba' | 'Juma' | 'Shanba' | 'Yakshanba'
  dayEn: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string; // e.g. "09:00", "14:30", "18:00"
  topic: string;
  level: string;
  enabled: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  schedule: ScheduleItem[];
  
  // Notification actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Schedule actions
  generateAutoSchedule: (level?: string) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  toggleScheduleItem: (id: string) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;
  
  // Schedule checker
  triggerScheduledAlert: (scheduleId: string) => void;
  simulateScheduleNotification: () => void;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: '1', day: 'Dushanba', dayEn: 'Monday', time: '09:00', topic: 'Present Simple Tense', level: 'A1', enabled: true },
  { id: '2', day: 'Seshanba', dayEn: 'Tuesday', time: '14:00', topic: 'Past Simple Tense', level: 'A2', enabled: true },
  { id: '3', day: 'Chorshanba', dayEn: 'Wednesday', time: '18:00', topic: 'Present Perfect vs Past Simple', level: 'B1', enabled: true },
  { id: '4', day: 'Payshanba', dayEn: 'Thursday', time: '11:00', topic: 'First & Second Conditionals', level: 'B1', enabled: true },
  { id: '5', day: 'Juma', dayEn: 'Friday', time: '16:30', topic: '"Used to" and Past Habits', level: 'B1', enabled: true },
  { id: '6', day: 'Shanba', dayEn: 'Saturday', time: '10:00', topic: 'Passive Voice (Present & Past)', level: 'B1', enabled: true },
  { id: '7', day: 'Yakshanba', dayEn: 'Sunday', time: '20:00', topic: 'Modal Verbs for Deduction', level: 'B2', enabled: true },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-welcome',
    title: '🎉 ENK Tutor - Darslar Jadvali',
    message: 'Haftalik darslar jadvalingiz muvaffaqiyatli yaratildi! Qong\'iroqchada barcha habarlaringiz saqlanadi.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'schedule_alert',
    read: false,
    actionUrl: '/dashboard'
  },
  {
    id: 'n-usedto',
    title: '⏰ Dars Eslatmasi: "Used to" and Past Habits',
    message: 'Bugungi rejalashtirilgan AI darsingiz tayyor. Mashqlarni va testlarni topshirish uchun bosing!',
    timestamp: new Date().toISOString(),
    type: 'lesson_reminder',
    read: false,
    actionUrl: '/ai-tutor?level=B1&topic="Used to" and Past Habits&auto=1'
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      schedule: DEFAULT_SCHEDULE,

      addNotification: (data) => {
        const newNotif: AppNotification = {
          ...data,
          id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          timestamp: new Date().toISOString(),
          read: false
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications]
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      generateAutoSchedule: (level = 'B1') => {
        const levelTopics: Record<string, string[]> = {
          A1: ['The Verb "to be" (am, is, are)', 'Present Simple Tense', 'Personal & Possessive Pronouns', 'Countable & Uncountable Nouns', 'Basic Prepositions (in, on, at)'],
          A2: ['Past Simple Tense', 'Present Continuous', 'Comparatives & Superlatives', 'Future with "going to"', 'Basic Modal Verbs (can, must, should)'],
          B1: ['Present Perfect vs Past Simple', 'Past Continuous', 'First & Second Conditionals', 'Passive Voice (Present & Past)', '"Used to" and Past Habits'],
          B2: ['Present Perfect Continuous', 'Third Conditional', 'Reported Speech', 'Future Perfect & Continuous', 'Modal Verbs for Deduction'],
          C1: ['Mixed Conditionals', 'Inversion for Emphasis', 'Advanced Passive Structures', 'Gerunds vs Infinitives', 'Cleft Sentences'],
          C2: ['The Subjunctive Mood', 'Narrative Tenses (Advanced)', 'Advanced Idioms & Expressions', 'Complex Clauses & Participles', 'Discourse Markers']
        };

        const topics = levelTopics[level] || levelTopics['B1'];
        const days: { day: string; dayEn: ScheduleItem['dayEn']; time: string }[] = [
          { day: 'Dushanba', dayEn: 'Monday', time: '09:00' },
          { day: 'Seshanba', dayEn: 'Tuesday', time: '14:00' },
          { day: 'Chorshanba', dayEn: 'Wednesday', time: '18:00' },
          { day: 'Payshanba', dayEn: 'Thursday', time: '11:00' },
          { day: 'Juma', dayEn: 'Friday', time: '16:30' },
          { day: 'Shanba', dayEn: 'Saturday', time: '10:00' },
          { day: 'Yakshanba', dayEn: 'Sunday', time: '20:00' }
        ];

        const newSchedule: ScheduleItem[] = days.map((d, idx) => ({
          id: 'sch-' + (idx + 1),
          day: d.day,
          dayEn: d.dayEn,
          time: d.time,
          topic: topics[idx % topics.length],
          level: level,
          enabled: true
        }));

        set({ schedule: newSchedule });

        get().addNotification({
          title: `📅 Yangi darslar jadvali yaratildi (${level})`,
          message: `Sizning ${level} darajangiz uchun avtomatik dars jadvali yangilandi. Belgilangan vaqtlarda eslatmalar kela boshlaydi!`,
          type: 'schedule_alert',
          actionUrl: '/dashboard'
        });
      },

      updateScheduleItem: (id, updates) => {
        set((state) => ({
          schedule: state.schedule.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
      },

      toggleScheduleItem: (id) => {
        set((state) => ({
          schedule: state.schedule.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
        }));
      },

      addScheduleItem: (item) => {
        const newItem: ScheduleItem = {
          ...item,
          id: 'sch-' + Date.now()
        };
        set((state) => ({ schedule: [...state.schedule, newItem] }));
      },

      deleteScheduleItem: (id) => {
        set((state) => ({
          schedule: state.schedule.filter(s => s.id !== id)
        }));
      },

      triggerScheduledAlert: (scheduleId) => {
        const item = get().schedule.find(s => s.id === scheduleId);
        if (!item || !item.enabled) return;

        get().addNotification({
          title: `⏰ Dars vaqti bo'ldi: ${item.topic}`,
          message: `${item.day} kuni soat ${item.time} dagi ${item.topic} (${item.level}) darsingiz boshlandi. Test va mashqlarni bajarish uchun bosing!`,
          type: 'lesson_reminder',
          actionUrl: `/ai-tutor?level=${item.level}&topic=${encodeURIComponent(item.topic)}&auto=1`
        });
      },

      simulateScheduleNotification: () => {
        const activeItems = get().schedule.filter(s => s.enabled);
        if (activeItems.length === 0) return;
        const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
        
        get().addNotification({
          title: `🔔 Dars eslatmasi: ${randomItem.topic}`,
          message: `Rejadagi dars vaqti keldi (${randomItem.day} ${randomItem.time}). AI Tutor orqali bilamingizni oshiring!`,
          type: 'lesson_reminder',
          actionUrl: `/ai-tutor?level=${randomItem.level}&topic=${encodeURIComponent(randomItem.topic)}&auto=1`
        });
      }
    }),
    {
      name: 'enfuture-notifications-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
