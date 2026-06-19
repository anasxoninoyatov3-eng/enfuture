import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/Card';
import { Button } from '@/Button';
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TopicTestProps {
  topic: string;
  questions: QuizQuestion[];
  onComplete: (score: number, mastered: boolean) => void;
  onSkip: () => void;
}

export const TopicTest: React.FC<TopicTestProps> = ({ 
  topic, 
  questions, 
  onComplete, 
  onSkip 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = Math.round((score + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0)) / questions.length * 100);
      setScore(finalScore);
      setIsComplete(true);
    }
  };

  const handleFinish = () => {
    const finalScore = isComplete 
      ? score 
      : Math.round((score + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0)) / questions.length * 100);
    const mastered = finalScore >= 70;
    onComplete(finalScore, mastered);
  };

  if (isComplete) {
    const mastered = score >= 70;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[600px]"
      >
        <Card className="p-12 max-w-2xl w-full text-center border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
          <div className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-8 ${
            mastered ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'
          }`}>
            {mastered ? (
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            ) : (
              <XCircle className="h-12 w-12 text-amber-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {mastered ? '🎉 Mavzuni Egalladingiz!' : '📚 Ushbu Mavzuni O\'rganing'}
          </h2>
          
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">
            {topic} testida {score}% to'pladingiz.
          </p>

          <p className="text-slate-600 dark:text-slate-300 mb-8">
            {mastered 
              ? 'Ajoyib! Bu mavzuda siz yetarli darajada bilimga ega ekansiz. Keyingi mavzuga o\'tishingiz mumkin.'
              : 'Yaxshi urinish! Ushbu mavzu bo\'yicha bilimingizni mustahkamlash uchun dars o\'rganing.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!mastered && (
              <Button onClick={onSkip} className="flex-1 max-w-xs bg-gradient-to-r from-indigo-600 to-purple-600">
                Darsni O\'rganish
              </Button>
            )}
            <Button
              onClick={handleFinish}
              variant={mastered ? 'default' : 'outline'}
              className="flex-1 max-w-xs"
            >
              {mastered ? 'Keyingi Mavzuga' : 'O\'tkazib Yuborish'}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {topic} - Bilimlarni Tekshirish
          </h2>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + (showExplanation ? 1 : 0)) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    showExplanation
                      ? index === currentQuestion.correctIndex
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : index === selectedAnswer
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-slate-200 dark:border-slate-700 opacity-50'
                      : selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0 ${
                      showExplanation
                        ? index === currentQuestion.correctIndex
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30'
                          : index === selectedAnswer
                            ? 'border-rose-500 text-rose-600 bg-rose-100 dark:bg-rose-900/30'
                            : 'border-slate-300 text-slate-400'
                        : selectedAnswer === index
                          ? 'border-indigo-500 text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30'
                          : 'border-slate-300 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`font-semibold flex-1 ${
                      showExplanation
                        ? index === currentQuestion.correctIndex
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : index === selectedAnswer
                            ? 'text-rose-800 dark:text-rose-300'
                            : 'text-slate-500'
                        : selectedAnswer === index
                          ? 'text-indigo-800 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {option}
                    </span>
                    {showExplanation && (
                      <>
                        {index === currentQuestion.correctIndex && (
                          <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                        )}
                        {index === selectedAnswer && index !== currentQuestion.correctIndex && (
                          <XCircle className="h-6 w-6 text-rose-600 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Tushuntirish:</h4>
              <p className="text-slate-600 dark:text-slate-300">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="flex justify-end pt-4 gap-4">
            {!showExplanation ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className="min-w-[120px] bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Tekshirish
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="min-w-[120px] flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Keyingi Savol' : 'Tugatish'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </Card>
    </div>
  );
};
