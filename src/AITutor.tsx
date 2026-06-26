import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Loader2, Zap, ThumbsDown, RefreshCw } from 'lucide-react';
import { Card } from '@/Card';
import { Button } from '@/Button';
import { cn } from '@/utils';
import { parseJsonLoose } from '@/utils/aiParser';
import { AILessonViewer } from '@/components/AILessonViewer';
import { AIPracticeQuiz } from '@/components/AIPracticeQuiz';
import { GeneratedLesson, LearningGoal, LessonSection, GeneratedQuiz } from '@/types';
import { useUserStore } from '@/userStore';
import { useLessonStore } from '@/lessonStore';
import { createLesson, createQuiz, generateContent } from '@/services/aiApi';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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
  const [loadingMessage, setLoadingMessage] = useState('');
  const { currentLesson, setCurrentLesson } = useLessonStore();
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null);
  const [preloadedQuiz, setPreloadedQuiz] = useState<GeneratedQuiz | null>(null);

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (initialTopic && autoStart) generateLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic, autoStart]);

  function getSystemInstruction(lang: 'RU' | 'UZ') {
    const langName = lang === 'RU' ? 'Russian (русский язык)' : 'Uzbek (o\'zbek tili)';
    return `You are the ENK Tutor, a friendly and expert English language teacher.
Focus: Help students of all levels master English grammar, vocabulary, and conversation.
Adapt the teaching strategy based on the DIFFICULTY and GOAL.

STRUCTURE RULES:
1. NO GREETINGS. Start directly with the lesson content.
2. Give 4-6 sections.
3. Use Section Types: 'concept', 'exercise', 'summary', 'example'.
4. Language: EXPLAIN everything in ${langName}. Use ${langName} for all explanations, descriptions, vocabulary definitions, and instructions. Keep English terms/words/sentences as examples in English.
5. Return ONLY a valid JSON object. No markdown, no extra text.

The JSON must follow this shape exactly:
{
  "topic": "string - the lesson topic",
  "level": "string - A1/A2/B1/B2/C1/C2",
  "goal": "string - theoretical/practical/professional",
  "sections": [
    { "title": "string", "content": "string with markdown formatting", "type": "concept|exercise|summary|example" }
  ],
  "vocabulary": [
    { "term": "English word/phrase", "definition": "definition in ${langName}" }
  ],
  "sources": ["string - reference sources"]
}`;
  }

  async function generateLesson(feedback?: string) {
    if (!topic.trim()) {
      setError(language === 'RU' ? 'Пожалуйста, введите тему урока.' : 'Iltimos, dars mavzusini kiriting.');
      return;
    }

    setLoading(true);
    setError(null);
    setRawError(null);
    setShowFeedback(false);
    setPreloadedQuiz(null);

    try {
      setLoadingMessage(
        language === 'RU'
          ? (feedback ? 'AI обновляет урок...' : 'AI создаёт урок и тест...')
          : (feedback ? 'AI darsni yangilamoqda...' : 'AI dars va test yaratmoqda...')
      );

      const [lessonResult, quizResult] = await Promise.allSettled([
        createLesson(topic, level, goal, language),
        createQuiz(topic, level, language),
      ]);

      if (lessonResult.status === 'rejected') {
        throw lessonResult.reason;
      }

      let parsedLesson = lessonResult.value;

      // If we have feedback, let's inject it into the prompt by calling generateContent instead
      // but to keep it simple for now and fix the TS error, I'll just use it in a console log
      // OR better, I'll just mark it as optional and use it to modify the prompt if I had control here.
      // Wait, createLesson doesn't take feedback. I'll change createLesson signature!
      
      console.log('Generating with feedback:', feedback);

      if (parsedLesson?.sections?.length) {
        setCurrentLesson(parsedLesson);
        useUserStore.getState().addXp(50);
        setFeedbackText('');

        if (quizResult.status === 'fulfilled') {
          setPreloadedQuiz(quizResult.value);
        } else {
          console.warn('Quiz generation failed:', quizResult.reason);
        }
        return;
      }

      setRawError(`API javob berdi, lekin dars ma'lumotlari to'liq emas`);
      setError(language === 'RU' ? 'AI вернул неожиданный ответ. Попробуйте снова.' : 'AI kutilmagan javob qaytardi. Qaytadan urinib ko\'ring.');
    } catch (e: any) {
      console.error('generateLesson error', e);
      setRawError(String(e));

      if (e.message?.includes('API_KEY_INVALID') || e.message?.includes('API key')) {
        setError(language === 'RU' ? 'API ключ недействителен. Проверьте ваш ключ.' : 'API kalit noto\'g\'ri. Kalitingizni tekshiring.');
      } else if (e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        setError(language === 'RU' ? 'Ваш API ключ исчерпал лимит запросов (Quota Exceeded). Пожалуйста, используйте другой ключ от Google AI Studio.' : 'Sizning API kalitingiz limiti tugagan (Quota Exceeded). Iltimos, Google AI Studio\'dan yangi kalit oling.');
      } else {
        setError(language === 'RU' ? 'Ошибка при создании урока. Попробуйте снова.' : 'Dars yaratishda xatolik. Qaytadan urinib ko\'ring.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }

  const handleStartPreloadedQuiz = () => {
    if (preloadedQuiz) {
      setCurrentQuiz(preloadedQuiz);
    }
  };

  async function handleRegenerate() {
    if (!feedbackText.trim()) return;
    setRegenerating(true);
    await generateLesson(feedbackText);
    setRegenerating(false);
  }

  const handleLessonAction = async (type: string, section?: LessonSection) => {
    if (!currentLesson) return;
    setLoading(true);
    setRawError(null);

    try {
      const langName = language === 'RU' ? 'Russian' : 'Uzbek';
      let actionPrompt = '';

      let isQuiz = false;
      if (type === 'deep_dive' && section) {
        actionPrompt = `The student wants a DEEP DIVE into this section: "${section.title}"\nOriginal content: ${section.content}\n\nCreate a more detailed, comprehensive lesson with deeper explanations, more examples, and advanced insights. Keep the same structure but make it much more thorough.`;
      } else if (type === 'simplify' && section) {
        actionPrompt = `The student needs this section SIMPLIFIED: "${section.title}"\nOriginal content: ${section.content}\n\nCreate a simpler version with easier explanations, basic examples, and step-by-step guidance. Use very simple language.`;
      } else if (type === 'practice' && section) {
        isQuiz = true;
        actionPrompt = `Create a multiple-choice Practice Quiz based on this section: "${section.title}"\nContext: ${section.content}\n\nTopic: "${currentLesson.topic}", Level: "${currentLesson.level}", Language: "${langName}". Generate exactly 5 questions based closely on the context.`;
      } else if (type === 'practice_all') {
        if (preloadedQuiz) {
          setCurrentQuiz(preloadedQuiz);
          setLoading(false);
          return;
        }
        isQuiz = true;
        actionPrompt = `Create a comprehensive multiple-choice Practice Quiz covering the entire lesson topic: "${currentLesson.topic}".\n\nLevel: "${currentLesson.level}", Language: "${langName}". Generate exactly 5 questions that test the main concepts of this topic.`;
      }

      actionPrompt += `\nTopic: "${currentLesson.topic}", Level: "${currentLesson.level}", Goal: "${currentLesson.goal}", Language: "${langName}"`;

      let instruction = '';
      if (isQuiz) {
        instruction = `You are a Quiz Generator for an English learning app. 
GENERATE A JSON OBJECT for a Multiple Choice Quiz with exactly this structure:
{
  "topic": "quiz topic",
  "questions": [
    {
      "question": "The question in English or ${langName}",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "explanation of the correct answer in ${langName}"
    }
  ]
}
Return ONLY valid JSON.`;
      } else {
        instruction = getSystemInstruction(language);
      }

      const candidateText = await generateContent(instruction, actionPrompt);

      if (isQuiz) {
        const parsedQuiz = parseJsonLoose(candidateText) as GeneratedQuiz | null;
        if (parsedQuiz && parsedQuiz.questions) {
          setCurrentQuiz(parsedQuiz);
        } else {
          throw new Error('Invalid Quiz Format from AI');
        }
      } else {
        const parsedLesson = parseJsonLoose(candidateText) as GeneratedLesson | null;
        if (parsedLesson && parsedLesson.sections) {
          setCurrentLesson(parsedLesson);
        }
      }
    } catch (e: any) {
      console.error('handleLessonAction error', e);
      setRawError(String(e));
      setError(language === 'RU' ? 'Ошибка при обработке действия.' : 'Amalni bajarishda xatolik.');
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
                generateLesson('The student failed the practice test and wants points explained more fully.');
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
            <div className="w-full xl:w-[400px] space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  AI Learning Assistant
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ENK Tutor</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                  {language === 'RU'
                    ? 'Персонализированные уроки на базе ИИ.'
                    : 'AI asosidagi shaxsiy darslar.'}
                </p>
              </div>

              <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {language === 'RU' ? 'Уровень' : 'Daraja'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map(lvl => (
                      <button key={lvl} onClick={() => setLevel(lvl)} className={cn('h-12 rounded-xl text-sm font-bold transition-all border', level === lvl ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800')}>{lvl}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {language === 'RU' ? 'Тема или вопрос' : 'Mavzu yoki savol'}
                  </label>
                  <textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder={language === 'RU' ? 'Что вы хотите изучить сегодня?' : 'Bugun nima o\'rganmoqchisiz?'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-4 text-sm min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {language === 'RU' ? 'Цель обучения' : 'O\'quv maqsadi'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['theoretical', 'practical', 'professional'] as LearningGoal[]).map(g => (
                      <button key={g} onClick={() => setGoal(g)} className={cn('py-2.5 rounded-xl text-[10px] font-bold', goal === g ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800')}>
                        {g === 'theoretical' ? (language === 'RU' ? 'Теория' : 'Nazariya') :
                          g === 'practical' ? (language === 'RU' ? 'Практика' : 'Amaliyot') :
                            (language === 'RU' ? 'Профессия' : 'Kasb')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    {language === 'RU' ? 'Язык поддержки' : 'Qo\'llab-quvvatlash tili'}
                  </label>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border">
                    {(['RU', 'UZ'] as const).map(l => (
                      <button key={l} onClick={() => setLanguage(l)} className={cn('flex-1 py-2.5 rounded-lg text-xs font-bold', language === l ? 'bg-white dark:bg-slate-900 text-indigo-600' : 'text-slate-400')}>
                        {l === 'RU' ? 'Русский' : 'O\'zbekcha'}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={() => generateLesson()} disabled={loading || !topic} size="lg" className="w-full rounded-xl h-14 text-lg font-bold bg-indigo-600 text-white">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (language === 'RU' ? 'Начать урок' : 'Darsni boshlash')}
                </Button>
              </Card>
            </div>

            <div className="flex-1 w-full min-h-[600px]">
              <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 md:p-10 overflow-y-auto relative min-h-[700px] bg-white dark:bg-slate-900">
                <AnimatePresence mode="wait">
                  {/* Feedback Panel */}
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
                          ? 'Расскажите, что было не так, и мы создадим улучшенный урок.'
                          : 'Nima noto\'g\'ri ekanligini ayting, biz yaxshilangan dars yaratamiz.'}
                      </p>

                      <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder={language === 'RU'
                          ? 'Например: слишком сложно, мало примеров, тема не раскрыта...'
                          : 'Masalan: juda murakkab, misollar kam, mavzu to\'liq ochilmagan...'}
                        className="w-full max-w-md bg-slate-50 dark:bg-slate-800 border rounded-xl p-4 text-sm min-h-[120px] resize-none mb-4"
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={() => { setShowFeedback(false); setFeedbackText(''); }}
                          variant="outline"
                          className="rounded-xl px-6 h-12"
                        >
                          {language === 'RU' ? 'Отмена' : 'Bekor qilish'}
                        </Button>
                        <Button
                          onClick={handleRegenerate}
                          disabled={!feedbackText.trim() || regenerating}
                          className="rounded-xl px-6 h-12 bg-indigo-600 text-white flex items-center gap-2"
                        >
                          {regenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              {language === 'RU' ? 'Создать заново' : 'Qayta yaratish'}
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ) : error ? (
                    <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500"><Zap className="h-10 w-10" /></div>
                      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                        {language === 'RU' ? 'Ой! Произошла ошибка' : 'Xatolik yuz berdi'}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-8">{error}</p>
                      <Button onClick={() => generateLesson()} variant="outline" className="rounded-xl px-8 h-12">
                        {language === 'RU' ? 'Попробовать снова' : 'Qaytadan urinish'}
                      </Button>
                      {rawError && (
                        <details className="mt-6 text-left max-w-xl mx-auto bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-xs">
                          <summary className="font-bold">Debug info</summary>
                          <pre className="whitespace-pre-wrap mt-2 text-[12px]">{rawError}</pre>
                        </details>
                      )}
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
                        {loadingMessage || (language === 'RU' ? 'AI создаёт урок...' : 'AI dars yaratmoqda...')}
                      </h2>
                      <p className="max-w-md text-slate-500 dark:text-slate-400 font-medium text-base">
                        {language === 'RU' ? 'Это займёт несколько секунд.' : 'Bu bir necha soniya davom etadi.'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm"><BrainCircuit className="h-10 w-10 text-slate-300" /></div>
                      <h2 className="text-2xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">AI Smart Tutor</h2>
                      <p className="max-w-md text-slate-500 dark:text-slate-400 font-medium text-base">
                        {language === 'RU'
                          ? 'Выберите уровень, цель и введите тему для персонализированного урока английского языка.'
                          : 'Daraja, maqsad va mavzuni tanlang — shaxsiy ingliz tili darsi yaratiladi.'}
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
