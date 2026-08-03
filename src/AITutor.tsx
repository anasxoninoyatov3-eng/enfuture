import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BrainCircuit, Loader2, BookOpen,
  ThumbsDown, RefreshCw, Lightbulb, FlaskConical, Layers,
  CheckCircle2, ChevronRight
} from 'lucide-react';
import { Card } from '@/Card';
import { Button } from '@/Button';
import { cn } from '@/utils';
import { generateContent } from '@/services/aiApi';
import { parseJsonLoose } from '@/utils/aiParser';
import { AILessonViewer } from '@/components/AILessonViewer';
import { AIPracticeQuiz } from '@/components/AIPracticeQuiz';
import { LearningGoal, LessonSection, GeneratedQuiz } from '@/types';
import { useUserStore } from '@/userStore';

import { useLessonStore } from '@/lessonStore';
import { createLesson, createQuiz } from '@/services/aiApi';


const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// All topics per level
const CURRICULUM: Record<string, string[]> = {
  A1: [
    'The Verb "to be" (am, is, are)',
    'Present Simple Tense',
    'Personal & Possessive Pronouns',
    'Countable & Uncountable Nouns',
    'Basic Prepositions (in, on, at)',
  ],
  A2: [
    'Past Simple Tense',
    'Present Continuous',
    'Comparatives & Superlatives',
    'Future with "going to"',
    'Basic Modal Verbs (can, must, should)',
  ],
  B1: [
    'Present Perfect vs Past Simple',
    'Past Continuous',
    'First & Second Conditionals',
    'Passive Voice (Present & Past)',
    '"Used to" and Past Habits',
  ],
  B2: [
    'Present Perfect Continuous',
    'Third Conditional',
    'Reported Speech',
    'Future Perfect & Continuous',
    'Modal Verbs for Deduction',
  ],
  C1: [
    'Mixed Conditionals',
    'Inversion for Emphasis',
    'Advanced Passive Structures',
    'Gerunds vs Infinitives',
    'Cleft Sentences',
  ],
  C2: [
    'The Subjunctive Mood',
    'Narrative Tenses (Advanced)',
    'Advanced Idioms & Expressions',
    'Complex Clauses & Participles',
    'Discourse Markers',
  ],
};

const LEARNING_GOALS: { value: LearningGoal; labelUZ: string; icon: React.ElementType; color: string }[] = [
  { value: 'theoretical', labelUZ: 'Nazariya', icon: Lightbulb, color: 'bg-violet-600' },
  { value: 'practical', labelUZ: 'Amaliyot', icon: FlaskConical, color: 'bg-emerald-600' },
  { value: 'professional', labelUZ: 'Kasb', icon: Layers, color: 'bg-amber-600' },
];

// parsePremadeLesson is removed since we always generate


export const AITutorPage = () => {
  const [searchParams] = useSearchParams();
  const initialLevel = searchParams.get('level') || 'B1';
  const initialTopic = searchParams.get('topic') || '';
  const autoStart = searchParams.get('auto') === '1';

  const [level, setLevel] = useState(initialLevel);
  const [topic, setTopic] = useState(initialTopic);
  const [goal, setGoal] = useState<LearningGoal>('theoretical');
  const [language, setLanguage] = useState<'RU' | 'UZ'>('UZ');

  const [loading, setLoading] = useState(false);
  const { currentLesson, setCurrentLesson } = useLessonStore();
  const [error, setError] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null);
  const [preloadedQuiz, setPreloadedQuiz] = useState<GeneratedQuiz | null>(null);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Topic selector panel
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  const isQuizMode = searchParams.get('mode') === 'quiz' || searchParams.get('quiz') === '1';

  useEffect(() => {
    if (initialTopic) {
      if (isQuizMode) {
        startQuizDirectly(initialTopic, initialLevel);
      } else if (autoStart) {
        loadLesson();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic, autoStart, isQuizMode]);

  async function startQuizDirectly(tName: string, tLvl: string) {
    setLoading(true);
    setError(null);
    try {
      const generatedQuiz = await createQuiz(tName, tLvl, language);
      if (generatedQuiz) {
        setCurrentQuiz(generatedQuiz);
      }
    } catch (e) {
      console.warn("Direct quiz creation failed", e);
      setError("Test yuklanishida xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  // When level changes, clear topic if it's not in the new level
  useEffect(() => {
    if (topic && CURRICULUM[level] && !CURRICULUM[level].includes(topic)) {
      setTopic('');
    }
  }, [level]);

  async function loadLesson() {
    if (!topic.trim()) {
      setError('Iltqs, dars mavzusini tanlang yoki kiriting.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowFeedback(false);
    setPreloadedQuiz(null);

    try {
      // Direct API generation of complete ready lesson (dars tayyor holda chiqadi)
      // Dars chiqqanda "create lesson" page'ga o'tmasdan shu ekranda qoladi
      const lessonData = await createLesson(topic, level, goal, language);

      setCurrentLesson(lessonData);
      useUserStore.getState().addXp(30);

      try {
        // Also pre-load a quiz if they want to practice
        const generatedQuiz = await createQuiz(topic, level, language);
        if (generatedQuiz) {
          setPreloadedQuiz(generatedQuiz);
        }
      } catch (e) {
        console.warn("Couldn't generate quick quiz initially, will try on click");
      }

    } catch (e: any) {
      console.error('loadLesson error', e);
      setError('Dars yuklanishda yoki yaratishda xatolik. API kaliti to\'g\'riligini tekshiring.');
    } finally {
      setLoading(false);
    }
  }

  const handleStartPreloadedQuiz = () => {
    if (preloadedQuiz) setCurrentQuiz(preloadedQuiz);
  };

  async function handleRegenerate() {
    if (!feedbackText.trim()) return;
    setRegenerating(true);
    // With pre-made lessons, "regenerate" means switch language or goal
    setShowFeedback(false);
    setFeedbackText('');
    await loadLesson();
    setRegenerating(false);
  }

  const handleLessonAction = async (type: string, section?: LessonSection) => {
    if (!currentLesson) return;

    // simplify / deep_dive → switch language or reload with different goal
    if (type === 'simplify') {
      // Simply trigger language shift or difficulty shift by regenerating
      await loadLesson();
      return;
    }

    if (type === 'practice' || type === 'practice_all') {
      if (preloadedQuiz) {
        setCurrentQuiz(preloadedQuiz);
        return;
      }
      setLoading(true);
      try {
        const generated = await createQuiz(currentLesson.topic, currentLesson.level, language);
        setCurrentQuiz(generated);
      } catch (e) {
        console.warn("Practice API failed", e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // deep_dive: try AI enhance for this section
    setLoading(true);
    try {
      const langName = language === 'RU' ? 'Russian' : 'Uzbek';
      const actionPrompt = `Deep dive into "${section?.title || currentLesson.topic}" for level ${currentLesson.level}. Topic context: ${section?.content?.slice(0, 300) || ''}. Create a detailed explanation with examples in ${langName}.`;
      const instruction = `You are an English tutor. Return only valid JSON: {"title":"string","content":"markdown string","type":"concept"}`;

      const text = await generateContent(instruction, actionPrompt);
      const parsed = parseJsonLoose(text) as any;
      if (parsed?.content && currentLesson.sections) {
        const updatedSections = currentLesson.sections.map((s) =>
          s.title === section?.title ? { ...s, content: parsed.content } : s
        );
        setCurrentLesson({ ...currentLesson, sections: updatedSections });
      }
    } catch (e) {
      console.warn('deep dive failed, showing original lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('p-4 md:p-8 mx-auto min-h-screen', (currentLesson || currentQuiz) ? 'max-w-[1800px] h-screen' : 'max-w-7xl')}>
      <AnimatePresence mode="wait">
        {currentQuiz ? (
          <motion.div
            key="fullscreen-quiz"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-900 overflow-hidden"
          >
            <AIPracticeQuiz
              quiz={currentQuiz}
              language={language}
              onBackToLesson={() => setCurrentQuiz(null)}
              onRetakeTopic={() => {
                setCurrentQuiz(null);
                loadLesson();
              }}
            />
          </motion.div>
        ) : currentLesson ? (
          <motion.div
            key="fullscreen-lesson"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 h-screen w-screen bg-slate-50 dark:bg-slate-800 overflow-hidden"
          >
            <AILessonViewer
              lesson={currentLesson}
              onAction={handleLessonAction}
              onClose={() => setCurrentLesson(null)}
              language={language}
              onFeedback={() => {
                setShowFeedback(true);
                setCurrentLesson(null);
              }}
              onStartQuiz={preloadedQuiz ? handleStartPreloadedQuiz : undefined}
              quizReady={!!preloadedQuiz}
              isLoading={loading}
            />
          </motion.div>
        ) : (
          <motion.div key="setup-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col xl:flex-row gap-8 items-start h-full">
            {/* LEFT: Controls */}
            <div className="w-full xl:w-[400px] space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  AI Learning Assistant
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ENK Tutor</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                  {language === 'RU' ? 'Персонализированные уроки на базе ИИ.' : 'AI asosidagi shaxsiy darslar.'}
                </p>
              </div>

              <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 space-y-6">
                {/* Level */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'RU' ? 'Уровень' : 'Daraja'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => { setLevel(lvl); setShowTopicPicker(false); }}
                        className={cn(
                          'h-12 rounded-xl text-sm font-bold transition-all border',
                          level === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'RU' ? 'Тема урока' : 'Dars mavzusi'}
                  </label>

                  {/* Topic picker button */}
                  <button
                    type="button"
                    onClick={() => setShowTopicPicker(v => !v)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                      topic
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                    )}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-sm font-medium truncate">
                      {topic || (language === 'RU' ? 'Выберите тему...' : 'Mavzuni tanlang...')}
                    </span>
                    {topic && <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />}
                  </button>

                  {/* Topic dropdown */}
                  <AnimatePresence>
                    {showTopicPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg bg-white dark:bg-slate-900"
                      >
                        {(CURRICULUM[level] || []).map((t) => {
                          return (
                            <button
                              key={t}
                              onClick={() => { setTopic(t); setShowTopicPicker(false); }}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all border-b last:border-b-0 border-slate-50 dark:border-slate-800',
                                topic === t
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              )}
                            >
                              <span className="flex-1 font-medium">{t}</span>
                              <div className="flex gap-1 shrink-0">
                                <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">AI DARS</span>
                              </div>
                              {topic === t && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Or manual input */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {language === 'RU' ? 'или введите вручную' : 'yoki qo\'lda kiriting'}
                      </span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <textarea
                      value={topic}
                      onChange={e => { setTopic(e.target.value); setShowTopicPicker(false); }}
                      placeholder={language === 'RU' ? 'Например: Past Continuous...' : 'Masalan: Past Continuous...'}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm min-h-[80px] resize-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Learning Goal */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'RU' ? 'Цель обучения' : 'O\'quv maqsadi'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEARNING_GOALS.map(g => {
                      const Icon = g.icon;
                      return (
                        <button
                          key={g.value}
                          onClick={() => setGoal(g.value)}
                          className={cn(
                            'py-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all border',
                            goal === g.value
                              ? `${g.color} text-white border-transparent`
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {g.labelUZ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'RU' ? 'Язык поддержки' : 'Qo\'llab-quvvatlash tili'}
                  </label>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {(['RU', 'UZ'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setLanguage(l)}
                        className={cn(
                          'flex-1 py-2.5 rounded-lg text-xs font-bold transition-all',
                          language === l ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400'
                        )}
                      >
                        {l === 'RU' ? 'Русский' : 'O\'zbekcha'}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => loadLesson()}
                  disabled={loading || !topic}
                  size="lg"
                  className="w-full rounded-xl h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>{language === 'RU' ? 'Начать урок' : 'Darsni boshlash'} <ChevronRight className="h-5 w-5" /></>
                  )}
                </Button>
              </Card>
            </div>

            {/* RIGHT: Preview / Status */}
            <div className="flex-1 w-full min-h-[600px]">
              <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 md:p-10 overflow-y-auto relative min-h-[700px] bg-white dark:bg-slate-900">
                <AnimatePresence mode="wait">

                  {showFeedback ? (
                    <motion.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="h-20 w-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6 text-amber-500">
                        <ThumbsDown className="h-10 w-10" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                        {language === 'RU' ? 'Что не понравилось?' : 'Nima yoqmadi?'}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-6">
                        {language === 'RU'
                          ? 'Расскажите, что было не так, мы перезагрузим урок.'
                          : 'Nima noto\'g\'ri ekanligini ayting, darsni qayta yuklaymiz.'}
                      </p>
                      <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder={language === 'RU'
                          ? 'Например: слишком сложно...'
                          : 'Masalan: juda murakkab...'}
                        className="w-full max-w-md bg-slate-50 dark:bg-slate-800 border rounded-xl p-4 text-sm min-h-[120px] resize-none mb-4"
                      />
                      <div className="flex gap-3">
                        <Button onClick={() => { setShowFeedback(false); setFeedbackText(''); }} variant="outline" className="rounded-xl px-6 h-12">
                          {language === 'RU' ? 'Отмена' : 'Bekor qilish'}
                        </Button>
                        <Button
                          onClick={handleRegenerate}
                          disabled={!feedbackText.trim() || regenerating}
                          className="rounded-xl px-6 h-12 bg-indigo-600 text-white flex items-center gap-2"
                        >
                          {regenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <><RefreshCw className="h-4 w-4" /> {language === 'RU' ? 'Снова' : 'Qayta'}</>
                          )}
                        </Button>
                      </div>
                    </motion.div>

                  ) : error ? (
                    <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500">
                        <BookOpen className="h-10 w-10" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Xatolik yuz berdi</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-8">{error}</p>
                      <Button onClick={() => { setError(null); }} variant="outline" className="rounded-xl px-8 h-12">
                        {language === 'RU' ? 'Назад' : 'Orqaga'}
                      </Button>
                    </motion.div>

                  ) : loading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="relative mb-8">
                        <div className="h-24 w-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                        </div>
                        <motion.div
                          className="absolute -inset-2 rounded-3xl border-2 border-indigo-600/20"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <h2 className="text-2xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">
                        {language === 'RU' ? 'Загрузка урока...' : 'Dars yuklanmoqda...'}
                      </h2>
                      <p className="max-w-md text-slate-500 dark:text-slate-400 font-medium text-base">
                        {language === 'RU' ? 'Секунду...' : 'Biroz kuting...'}
                      </p>
                    </motion.div>

                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                        <BrainCircuit className="h-10 w-10 text-slate-300" />
                      </div>
                      <h2 className="text-2xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Smart Tutor</h2>
                      <p className="max-w-md text-slate-500 dark:text-slate-400 font-medium text-base mb-8">
                        {language === 'RU'
                          ? 'Выберите уровень, тему и нажмите «Начать урок»'
                          : 'Daraja va mavzuni tanlang, so\'ng "Darsni boshlash" tugmasini bosing.'}
                      </p>

                      {/* Quick stats */}
                      <div className="flex gap-4 flex-wrap justify-center">
                        {Object.entries(CURRICULUM).map(([lvl]) => {
                          return (
                            <div key={lvl} className="text-center">
                              <div className="text-lg font-black text-slate-900 dark:text-white">AI</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{lvl}</div>
                            </div>
                          );
                        })}

                      </div>
                      <p className="text-xs text-slate-400 mt-3">
                        {language === 'RU' ? 'Генерация ИИ' : 'AI Yaratuvchi Dastur'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AITutorPage;
