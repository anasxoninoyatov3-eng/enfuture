import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Bell, Play, Edit2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Card';
import { Button } from '@/Button';
import { useNotificationStore, ScheduleItem } from '@/notificationStore';
import { useUserStore } from '@/userStore';
import { cn } from '@/utils';

export const LessonSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    schedule,
    toggleScheduleItem,
    generateAutoSchedule,
    triggerScheduledAlert,
    updateScheduleItem
  } = useNotificationStore();

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editTopic, setEditTopic] = useState('');

  const currentLevel = user?.currentLevel || 'B1';

  const handleStartLesson = (item: ScheduleItem) => {
    navigate(`/ai-tutor?level=${item.level}&topic=${encodeURIComponent(item.topic)}&auto=1`);
  };

  const handleSaveEdit = () => {
    if (editingItem && editTime && editTopic) {
      updateScheduleItem(editingItem.id, {
        time: editTime,
        topic: editTopic
      });
      setEditingItem(null);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 font-sans">
      <CardHeader className="p-0 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="h-3.5 w-3.5" />
            Shaxsiy O'quv Rejasi
          </div>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
            Darslar Jadvali va Eslatmalar
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
            Belgilangan vaqtlarda qong'iroqchada avtomatik habar va dars eslatmalari chiqadi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => generateAutoSchedule(currentLevel)}
            variant="outline"
            className="rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-xs font-bold h-10 px-4"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            AI Jadval Yaratish ({currentLevel})
          </Button>
        </div>
      </CardHeader>

      {/* Schedule Items Grid */}
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {schedule.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              className={cn(
                "p-5 rounded-2xl border transition-all flex flex-col justify-between relative group",
                item.enabled
                  ? "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm"
                  : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 opacity-60"
              )}
            >
              {/* Top Row: Day & Time */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 shadow-2xs">
                  {item.day}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.time}
                  </div>

                  <button
                    onClick={() => toggleScheduleItem(item.id)}
                    title={item.enabled ? "Eslatmani o'chirish" : "Eslatmani yoqish"}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      item.enabled
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                        : "text-slate-400 bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <Bell className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Middle: Topic info */}
              <div className="my-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {item.level}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">AI DARS</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                  {item.topic}
                </h4>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => triggerScheduledAlert(item.id)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  title="Ushbu dars uchun qong'iroqchaga habar yuborish"
                >
                  <Bell className="h-3 w-3" />
                  Xabar yuborish
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setEditTime(item.time);
                      setEditTopic(item.topic);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Tahrirlash"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <Button
                    onClick={() => handleStartLesson(item)}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3"
                  >
                    <Play className="h-3 w-3 mr-1 fill-white" />
                    Boshlash
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingItem.day} dars vaqtini tahrirlash
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Dars vaqti (HH:MM)</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Dars mavzusi</label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="rounded-xl px-5 h-11"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="rounded-xl px-5 h-11 bg-indigo-600 text-white font-bold"
              >
                Saqlash
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Card>
  );
};
