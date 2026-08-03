import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, Trash2, Calendar, BookOpen, Sparkles,
  ExternalLink, Zap, CheckCheck
} from 'lucide-react';
import { useNotificationStore, AppNotification } from '@/notificationStore';
import { cn } from '@/utils';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    simulateScheduleNotification
  } = useNotificationStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.actionUrl) {
      setIsOpen(false);
      navigate(n.actionUrl);
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'lesson_reminder':
        return <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'schedule_alert':
        return <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'achievement':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case 'quiz_alert':
        return <Zap className="h-4 w-4 text-rose-500" />;
      default:
        return <Bell className="h-4 w-4 text-indigo-500" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return 'Hozirgina';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} daqiqa oldin`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} soat oldin`;
    return `${Math.floor(diffSec / 86400)} kun oldin`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-10 w-10 rounded-xl flex items-center justify-center transition-all border",
          isOpen
            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300"
            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        )}
        title="Habarlar va Eslatmalar"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Habarlar va Eslatmalar
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold">
                    {unreadCount} yangi
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  O'qildi
                </button>
              )}
            </div>

            {/* Simulated Live Alert trigger for testing */}
            <div className="px-4 py-2 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                🔔 Dars vaqti habarini sinash:
              </span>
              <button
                onClick={() => simulateScheduleNotification()}
                className="text-[11px] font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Xabar kelsin
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="h-8 w-8 mx-auto opacity-40 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium">Hozircha habarlar yo'q</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-4 transition-colors relative group flex items-start gap-3",
                      !n.read
                        ? "bg-indigo-50/40 dark:bg-indigo-900/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {formatTimeAgo(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {n.actionUrl && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Darsga o'tish <ExternalLink className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          title="O'qilgan deb belgilash"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        title="O'chirish"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Jami {notifications.length} ta habar</span>
                <button
                  onClick={clearAllNotifications}
                  className="font-bold text-rose-500 hover:underline"
                >
                  Hammasini tozalash
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
