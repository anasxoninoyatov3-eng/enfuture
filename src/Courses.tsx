import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Trophy, Star, ArrowRight, Zap, Shield, Crown,
  Clock, Target, Sparkles, ChevronRight, Play, Edit3, X, Save,
  FlaskConical, Layers, Lightbulb, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';

// === TYPES ===
type LessonCategory = 'theoretical' | 'easy' | 'other';

interface LessonItem {
  id: string;
  topic: string;
  category: LessonCategory;
  duration: string;
}

interface CurriculumItem {
  level: string;
  name: string;
  description: string;
  gradient: string;
  bgLight: string;
  textAccent: string;
  borderAccent: string;
  icon: React.ElementType;
  duration: string;
  difficulty: number;
  lessons: LessonItem[];
}

// === CATEGORY CONFIG ===
const CATEGORIES: { value: LessonCategory; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'theoretical', label: 'Nazariy', icon: Lightbulb, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { value: 'easy', label: 'Oson', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'other', label: 'Boshqacha', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

// === CURRICULUM DATA ===
const initialCurriculum: CurriculumItem[] = [
  {
    level: 'A1',
    name: 'Beginner',
    description: 'Start from zero. Master the very first building blocks of English with confidence.',
    gradient: 'from-sky-400 via-blue-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textAccent: 'text-sky-600',
    borderAccent: 'border-sky-200',
    icon: Star,
    duration: '4 weeks',
    difficulty: 1,
    lessons: [
      { id: 'a1-1', topic: 'The Verb "to be" (am, is, are)', category: 'theoretical', duration: '15 min' },
      { id: 'a1-2', topic: 'Present Simple Tense', category: 'theoretical', duration: '20 min' },
      { id: 'a1-3', topic: 'Personal & Possessive Pronouns', category: 'easy', duration: '15 min' },
      { id: 'a1-4', topic: 'Countable & Uncountable Nouns', category: 'theoretical', duration: '15 min' },
      { id: 'a1-5', topic: 'Basic Prepositions (in, on, at)', category: 'easy', duration: '10 min' },
    ],
  },
  {
    level: 'A2',
    name: 'Elementary',
    description: 'Build your foundation for everyday conversations and common situations.',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textAccent: 'text-emerald-600',
    borderAccent: 'border-emerald-200',
    icon: Trophy,
    duration: '5 weeks',
    difficulty: 2,
    lessons: [
      { id: 'a2-1', topic: 'Past Simple Tense', category: 'theoretical', duration: '20 min' },
      { id: 'a2-2', topic: 'Present Continuous', category: 'theoretical', duration: '20 min' },
      { id: 'a2-3', topic: 'Comparatives & Superlatives', category: 'easy', duration: '15 min' },
      { id: 'a2-4', topic: 'Future with "going to"', category: 'easy', duration: '15 min' },
      { id: 'a2-5', topic: 'Basic Modal Verbs (can, must, should)', category: 'theoretical', duration: '20 min' },
    ],
  },
  {
    level: 'B1',
    name: 'Intermediate',
    description: 'Start expressing more complex thoughts and communicate more naturally.',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    bgLight: 'bg-amber-50',
    textAccent: 'text-amber-600',
    borderAccent: 'border-amber-200',
    icon: Zap,
    duration: '6 weeks',
    difficulty: 3,
    lessons: [
      { id: 'b1-1', topic: 'Present Perfect vs Past Simple', category: 'theoretical', duration: '25 min' },
      { id: 'b1-2', topic: 'Past Continuous', category: 'theoretical', duration: '20 min' },
      { id: 'b1-3', topic: 'First & Second Conditionals', category: 'theoretical', duration: '25 min' },
      { id: 'b1-4', topic: 'Passive Voice (Present & Past)', category: 'theoretical', duration: '20 min' },
      { id: 'b1-5', topic: '"Used to" and Past Habits', category: 'easy', duration: '15 min' },
    ],
  },
  {
    level: 'B2',
    name: 'Upper Intermediate',
    description: 'Achieve fluency and understand native speakers in real situations.',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    bgLight: 'bg-rose-50',
    textAccent: 'text-rose-600',
    borderAccent: 'border-rose-200',
    icon: BookOpen,
    duration: '7 weeks',
    difficulty: 4,
    lessons: [
      { id: 'b2-1', topic: 'Present Perfect Continuous', category: 'theoretical', duration: '25 min' },
      { id: 'b2-2', topic: 'Third Conditional', category: 'theoretical', duration: '25 min' },
      { id: 'b2-3', topic: 'Reported Speech', category: 'theoretical', duration: '25 min' },
      { id: 'b2-4', topic: 'Future Perfect & Continuous', category: 'other', duration: '20 min' },
      { id: 'b2-5', topic: 'Modal Verbs for Deduction', category: 'other', duration: '20 min' },
    ],
  },
  {
    level: 'C1',
    name: 'Advanced',
    description: 'Master complex grammar structures and academic/professional vocabulary.',
    gradient: 'from-violet-500 via-purple-600 to-indigo-700',
    bgLight: 'bg-violet-50',
    textAccent: 'text-violet-600',
    borderAccent: 'border-violet-200',
    icon: Shield,
    duration: '8 weeks',
    difficulty: 5,
    lessons: [
      { id: 'c1-1', topic: 'Mixed Conditionals', category: 'theoretical', duration: '30 min' },
      { id: 'c1-2', topic: 'Inversion for Emphasis', category: 'other', duration: '25 min' },
      { id: 'c1-3', topic: 'Advanced Passive Structures', category: 'theoretical', duration: '25 min' },
      { id: 'c1-4', topic: 'Gerunds vs Infinitives', category: 'easy', duration: '20 min' },
      { id: 'c1-5', topic: 'Cleft Sentences', category: 'other', duration: '25 min' },
    ],
  },
  {
    level: 'C2',
    name: 'Proficiency',
    description: 'Reach native-level mastery with extreme nuance, style, and precision.',
    gradient: 'from-slate-600 via-slate-700 to-slate-900',
    bgLight: 'bg-slate-50 dark:bg-slate-800',
    textAccent: 'text-slate-600 dark:text-slate-300',
    borderAccent: 'border-slate-300',
    icon: Crown,
    duration: '10 weeks',
    difficulty: 6,
    lessons: [
      { id: 'c2-1', topic: 'The Subjunctive Mood', category: 'theoretical', duration: '30 min' },
      { id: 'c2-2', topic: 'Narrative Tenses (Advanced)', category: 'theoretical', duration: '35 min' },
      { id: 'c2-3', topic: 'Advanced Idioms & Expressions', category: 'other', duration: '25 min' },
      { id: 'c2-4', topic: 'Complex Clauses & Participles', category: 'theoretical', duration: '30 min' },
      { id: 'c2-5', topic: 'Discourse Markers', category: 'other', duration: '25 min' },
    ],
  },
];

// === SUBCOMPONENTS ===
const DifficultyDots = ({ count, total = 6, accent }: { count: number; total?: number; accent: string }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={cn('h-1.5 w-1.5 rounded-full transition-all', i < count ? accent : 'bg-slate-200')}
      />
    ))}
  </div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

// === EDIT LESSON MODAL ===
const EditLessonModal = ({
  lesson,
  onSave,
  onClose,
}: {
  lesson: LessonItem;
  onSave: (updated: LessonItem) => void;
  onClose: () => void;
}) => {
  const [topic, setTopic] = useState(lesson.topic);
  const [category, setCategory] = useState<LessonCategory>(lesson.category);
  const [duration, setDuration] = useState(lesson.duration);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Darsni tahrirlash</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Dars mavzusi</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/50 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Kategoriya</label>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-bold',
                      category === cat.value
                        ? `border-indigo-600 ${cat.bg} ${cat.color}`
                        : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Davomiyligi</label>
            <input
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="15 min"
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/50 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Bekor qilish
            </button>
            <button
              onClick={() => { onSave({ ...lesson, topic, category, duration }); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" /> Saqlash
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// === MAIN PAGE ===
export const CoursesPage = () => {
  const [activeLevel, setActiveLevel] = useState<string>('B1');
  const [activeCategory, setActiveCategory] = useState<LessonCategory | 'all'>('all');
  const [curriculum, setCurriculum] = useState(initialCurriculum);
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const navigate = useNavigate();

  const active = curriculum.find((c) => c.level === activeLevel)!;

  const filteredLessons = activeCategory === 'all'
    ? active.lessons
    : active.lessons.filter(l => l.category === activeCategory);

  const handleStartLesson = (level: string, topic: string) => {
    navigate(`/ai-tutor?level=${level}&topic=${encodeURIComponent(topic)}&auto=1`);
  };

  const handleSaveLesson = (updated: LessonItem) => {
    setCurriculum(prev => prev.map(course => ({
      ...course,
      lessons: course.lessons.map(l => l.id === updated.id ? updated : l)
    })));
  };

  const getCategoryInfo = (cat: LessonCategory) => CATEGORIES.find(c => c.value === cat)!;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/60">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-violet-100/50 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                To'liq o'quv dasturi
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                Sizning <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Kurslaringiz</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-xl leading-relaxed">
                A1 dan C2 gacha 6 daraja. Darajani tanlang, mavzuni bosing va AI bilan o'rganishni boshlang.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 shrink-0">
              {[
                { label: 'Darajalar', value: '6', icon: Target },
                { label: 'Darslar', value: '30+', icon: BookOpen },
                { label: 'AI-Powered', value: '100%', icon: Sparkles },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-xl px-5 py-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Level Pills ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {curriculum.map((item) => {
              const Icon = item.icon;
              const isActive = item.level === activeLevel;
              return (
                <button
                  key={item.level}
                  onClick={() => { setActiveLevel(item.level); setActiveCategory('all'); }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0',
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.level}</span>
                  <span className={cn('font-normal hidden sm:inline', isActive ? 'text-white/80' : 'text-slate-400')}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* ── Left: Level Card ── */}
              <div className="lg:col-span-4 space-y-6">

                {/* Hero level badge */}
                <div className={cn('relative overflow-hidden rounded-2xl p-8 text-white bg-gradient-to-br', active.gradient)}>
                  <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/10" />

                  <div className="relative space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Daraja</div>
                        <div className="text-6xl font-black leading-none">{active.level}</div>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <active.icon className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black">{active.name}</h2>
                      <p className="text-white/75 text-sm font-medium leading-relaxed mt-1.5">{active.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        {active.duration}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Qiyinlik</span>
                        <DifficultyDots count={active.difficulty} accent="bg-white dark:bg-slate-900" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Other levels mini-list */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pb-2">Barcha Darajalar</div>
                  {curriculum.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.level === activeLevel;
                    return (
                      <button
                        key={item.level}
                        onClick={() => { setActiveLevel(item.level); setActiveCategory('all'); }}
                        className={cn(
                          'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 text-left',
                          isActive ? `${item.bgLight} ${item.borderAccent} border` : 'hover:bg-slate-50 dark:bg-slate-800 border border-transparent'
                        )}
                      >
                        <div className={cn(
                          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                          isActive ? `bg-gradient-to-br ${item.gradient}` : 'bg-slate-100'
                        )}>
                          <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn('font-bold text-sm', isActive ? item.textAccent : 'text-slate-700')}>
                            {item.level} — {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {item.lessons.length} dars · {item.duration}
                          </div>
                        </div>
                        {isActive && <ChevronRight className={cn('h-4 w-4 shrink-0', item.textAccent)} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Right: Lessons ── */}
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br', active.gradient)}>
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">Mavjud Darslar</h3>
                          <p className="text-[11px] text-slate-400 font-semibold">{active.level} · {active.name}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'text-[11px] font-black px-3 py-1.5 rounded-full',
                        active.bgLight, active.textAccent
                      )}>
                        {filteredLessons.length} Dars
                      </span>
                    </div>

                    {/* Category filter */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveCategory('all')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                          activeCategory === 'all'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                        )}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        Barchasi
                      </button>
                      {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                              activeCategory === cat.value
                                ? `${cat.bg} ${cat.color} border border-current/20`
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lessons list */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-slate-50"
                  >
                    {filteredLessons.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">Bu kategoriyada dars yo'q</p>
                      </div>
                    ) : (
                      filteredLessons.map((lesson, index) => {
                        const catInfo = getCategoryInfo(lesson.category);
                        const CatIcon = catInfo.icon;
                        return (
                          <motion.div
                            key={lesson.id}
                            variants={cardVariants}
                            className="group flex items-center gap-5 px-6 py-4 hover:bg-slate-50 dark:bg-slate-800/30 transition-all duration-200"
                          >
                            {/* Number badge */}
                            <div className={cn(
                              'shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300',
                              `group-hover:bg-gradient-to-br group-hover:${active.gradient} group-hover:text-white`,
                              'bg-slate-100 text-slate-400'
                            )}>
                              {(index + 1).toString().padStart(2, '0')}
                            </div>

                            {/* Topic info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 text-sm truncate group-hover:text-slate-900 dark:text-white transition-colors">
                                {lesson.topic}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <div className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md', catInfo.bg, catInfo.color)}>
                                  <CatIcon className="h-2.5 w-2.5" />
                                  {catInfo.label}
                                </div>
                                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              {/* Edit button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLesson(lesson);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Tahrir
                              </button>

                              {/* Start button */}
                              <button
                                type="button"
                                onClick={() => handleStartLesson(active.level, lesson.topic)}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all',
                                  `bg-gradient-to-r ${active.gradient}`
                                )}
                              >
                                <Play className="h-3.5 w-3.5 fill-white" />
                                Boshlash
                              </button>
                            </div>

                            {/* Arrow (always visible) */}
                            <ArrowRight className={cn(
                              'shrink-0 h-4 w-4 transition-all duration-300',
                              'text-slate-200 group-hover:opacity-0 group-hover:translate-x-2',
                              active.textAccent
                            )} />
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>

                  {/* Footer CTA */}
                  <div className="px-6 py-5 border-t border-slate-50 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Istalgan darsni boshlang — AI o'qituvchi sizga moslashadi.
                    </p>
                    <button
                      onClick={() => handleStartLesson(active.level, active.lessons[0].topic)}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105',
                        active.gradient
                      )}
                    >
                      <Zap className="h-4 w-4" />
                      Birinchi darsni boshlash
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingLesson && (
          <EditLessonModal
            lesson={editingLesson}
            onSave={handleSaveLesson}
            onClose={() => setEditingLesson(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
