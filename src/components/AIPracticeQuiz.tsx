import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/Button';
import { GeneratedQuiz } from '@/types';
import { cn } from '@/utils';

interface AIPracticeQuizProps {
  quiz: GeneratedQuiz;
  language: 'RU' | 'UZ';
  onBackToLesson: () => void;
  onRetakeTopic: () => void;
}

export const AIPracticeQuiz: React.FC<AIPracticeQuizProps> = ({ quiz, language, onBackToLesson, onRetakeTopic }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const t = {
    practice: language === 'RU' ? 'Практика' : 'Amaliyot',
    question: language === 'RU' ? 'Вопрос' : 'Savol',
    of: language === 'RU' ? 'из' : '/',
    next: language === 'RU' ? 'Следующий' : 'Keyingi',
    finish: language === 'RU' ? 'Завершить' : 'Tugatish',
    results: language === 'RU' ? 'Результаты' : 'Natijalar',
    score: language === 'RU' ? 'Твоя оценка:' : 'Sizning bahoingiz:',
    awesome: language === 'RU' ? 'Отлично!' : 'Ajoyib!',
    needsReview: language === 'RU' ? 'Нужно повторить тему.' : 'Mavzuni takrorlash kerak.',
    backToLesson: language === 'RU' ? 'Вернуться к уроку' : 'Darsga qaytish',
    reviewTopic: language === 'RU' ? 'Повторить тему (создать заново)' : 'Mavzuni takrorlash (yangi dars)',
  };

  const handleSelectOption = (idx: number) => {
    setAnswers({ ...answers, [currentQuestionIdx]: idx });
  };

  const handleNext = () => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });
    return score;
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= Math.ceil(quiz.questions.length / 2);

    return (
      <div className="h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-2xl w-full border border-slate-100 dark:border-slate-700 font-sans"
        >
          <div className="text-center mb-10">
            <div className={cn(
              "h-24 w-24 rounded-full mx-auto flex items-center justify-center mb-6",
              passed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                     : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
            )}>
              {passed ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              {t.results}
            </h2>
            <p className="text-xl font-medium text-slate-600 dark:text-slate-300">
              {t.score} <span className={cn("font-bold", passed ? "text-emerald-600" : "text-rose-600")}>{score} {t.of} {quiz.questions.length}</span>
            </p>
            
            <p className="mt-4 text-slate-500 font-medium">
              {passed ? t.awesome : t.needsReview}
            </p>
          </div>

          <div className="space-y-6 mb-10">
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div key={i} className={cn("p-4 rounded-2xl border", isCorrect ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30" : "bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/30")}>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{i + 1}. {q.question}</p>
                  <p className="text-sm font-medium mb-1">
                    <span className="text-slate-500">Your answer: </span>
                    <span className={isCorrect ? "text-emerald-600" : "text-rose-600 line-through"}>{q.options[answers[i]]}</span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm font-medium text-emerald-600 mb-2">
                      Correct answer: {q.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl leading-relaxed">
                    💡 {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onBackToLesson} variant="outline" className="rounded-xl h-14 px-8 font-bold text-slate-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t.backToLesson}
            </Button>
            {!passed && (
              <Button onClick={onRetakeTopic} className="rounded-xl h-14 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                <RefreshCw className="h-5 w-5 mr-2" />
                {t.reviewTopic}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIdx];
  const hasAnsweredCurrent = answers[currentQuestionIdx] !== undefined;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBackToLesson} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{t.practice}: {quiz.topic}</span>
          </div>
        </div>
        <div className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-4 py-1.5 rounded-full">
          {currentQuestionIdx + 1} / {quiz.questions.length}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {currentQ.question}
              </h2>

              <div className="space-y-4">
                {currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentQuestionIdx] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
                      className={cn(
                        "w-full flex items-center gap-4 text-left p-4 rounded-xl border-2 transition-all font-medium text-base",
                        isSelected 
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-indigo-600" : "border-slate-300 dark:border-slate-600"
                      )}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 shrink-0 z-10 flex justify-center">
        <div className="w-full max-w-3xl flex justify-end">
          <Button
            size="lg"
            disabled={!hasAnsweredCurrent}
            onClick={handleNext}
            className="rounded-xl h-14 px-10 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 disabled:shadow-none"
          >
            {currentQuestionIdx < quiz.questions.length - 1 ? t.next : t.finish}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
