import { useEffect, useState } from 'react';
import { Button } from '@/Button';
import { Card, CardContent } from '@/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { Link } from 'react-router-dom';
import { Helicopter3D } from '@/Helicopter3D';

import {
   Globe,
   ChevronRight, CheckCircle2, Sparkles, BookOpen, TrendingUp, FastForward
} from 'lucide-react';

const ANIMATION_WORDS = [
   "Present Simple",
   "Present Continuous",
   "Present Simple",
   "Past Simple",
   "Past Continuous",
];

function useSmartTypewriter(words: string[], start: boolean = true, typingSpeed = 80, deletingSpeed = 40, delay = 2000) {
   const [text, setText] = useState<string>('');
   const [isDeleting, setIsDeleting] = useState(false);
   const [index, setIndex] = useState(0);

   useEffect(() => {
      if (!start) return;
      let timeout: NodeJS.Timeout;
      const currentWord = words[index % words.length];
      const nextWord = words[(index + 1) % words.length];

      let commonLen = 0;
      while (
         commonLen < currentWord.length &&
         commonLen < nextWord.length &&
         currentWord[commonLen] === nextWord[commonLen]
      ) {
         commonLen++;
      }

      if (!isDeleting) {
         if (text !== currentWord) {
            timeout = setTimeout(() => setText(currentWord.slice(0, text.length + 1)), typingSpeed);
         } else {
            timeout = setTimeout(() => setIsDeleting(true), delay);
         }
      } else {
         if (text.length > commonLen) {
            timeout = setTimeout(() => setText(text.slice(0, -1)), deletingSpeed);
         } else {
            setIsDeleting(false);
            setIndex((i: number) => i + 1);
         }
      }

      return () => clearTimeout(timeout);
   }, [text, isDeleting, index, words, typingSpeed, deletingSpeed, delay, start]);

   return text;
}

export const HomePage = () => {
   const [stage, setStage] = useState(0);
   const [buttonPressed, setButtonPressed] = useState(false);
   const animatedText = useSmartTypewriter(ANIMATION_WORDS, buttonPressed || stage >= 3);

   useEffect(() => {
      const timings = [
         { stage: 1, delay: 500 },   // 3D Helicopter flies in & hovers above 3D button
         { stage: 2, delay: 1800 },  // Helicopter lowers down
         { stage: 3, delay: 3000 },  // Helicopter PRESSES the 3D Button!
         { stage: 5, delay: 4800 },  // Helicopter ascends and flies away
         { stage: 6, delay: 6200 }   // Transition complete -> Main Hero Text
      ];
      const timeouts = timings.map(t => setTimeout(() => setStage(t.stage), t.delay));
      return () => timeouts.forEach(clearTimeout);
   }, []);

   const handlePressButton = () => {
      setButtonPressed(true);
   };

   const triggerHelicopterPress = () => {
      setStage(3);
      setButtonPressed(true);
   };

   const skipIntro = () => {
      setButtonPressed(true);
      setStage(6);
   };

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: { staggerChildren: 0.1, delayChildren: 0.2 }
      }
   };

   const itemVariants: any = {
      visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
   };

   return (
      <div className="min-h-screen bg-white dark:bg-slate-900 selection:bg-indigo-600 selection:text-white">
         {/* Navigation */}
         <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-2 md:gap-3">
               <img src="/favicon.svg" alt="Logo" className="h-7 w-7 md:h-8 md:w-8 object-contain" />
               <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">ENK English</span>
            </div>

            <div className="hidden lg:flex items-center gap-10">
               <a href="#features" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Features</a>
               <a href="#about" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">About</a>
               <a href="#community" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Community</a>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {stage < 6 && (
                <button
                  type="button"
                  onClick={skipIntro}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer mr-2"
                >
                  <FastForward className="h-3.5 w-3.5" /> O'tkazib yuborish
                </button>
              )}
              <Button asChild variant="ghost" className="px-3 md:px-4 font-semibold text-sm text-slate-600 dark:text-slate-300">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-lg h-9 md:h-10 px-4 md:px-6 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
         </nav>

         <main>
            {/* Hero Section */}
            <section className="relative pt-20 md:pt-28 pb-20 md:pb-36 px-4 md:px-6 bg-slate-50 dark:bg-slate-800/50 overflow-hidden min-h-screen">
               <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">

                  {/* 3D Helicopter Interactive Canvas */}
                  <AnimatePresence>
                     {stage < 6 && (
                        <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="w-full relative z-30 flex flex-col items-center"
                        >
                           <Helicopter3D
                              stage={stage}
                              onPressButton={handlePressButton}
                              onFinish={() => setStage(6)}
                           />
                           {stage < 3 && (
                             <motion.button
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               onClick={triggerHelicopterPress}
                               className="mt-[-20px] mb-4 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                             >
                               🚁 Vertolyot Tugmani Bossin!
                             </motion.button>
                           )}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <motion.div
                     variants={containerVariants}
                     initial="hidden"
                     animate="visible"
                     className="space-y-6 md:space-y-8"
                  >
                     <motion.div
                        variants={itemVariants}
                        className={cn(
                           "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-indigo-600 shadow-sm transition-all duration-700",
                           buttonPressed || stage >= 3 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
                        )}
                     >
                        <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" /> Next-Gen English Learning
                     </motion.div>

                     <motion.h1
                        className={cn(
                           "text-[clamp(2.5rem,7vw,5rem)] font-black text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1] tracking-tight relative z-40 transition-all duration-700",
                           buttonPressed || stage >= 3 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                        )}
                     >
                        Welcome to enfuture!<br />
                        <span className="text-[clamp(1.5rem,3.5vw,2.5rem)] text-slate-500 dark:text-slate-400 block mt-2">Learning with us</span>
                        <span className="text-indigo-600 block min-h-[1.2em] relative inline-block mt-2">
                           {animatedText}
                           <span className={cn("absolute -right-[0.5em] font-light", (buttonPressed || stage >= 3) && "animate-pulse")}>|</span>
                        </span>
                     </motion.h1>

                     <motion.div
                        className={cn(
                           "transition-all duration-1000",
                           buttonPressed || stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                        )}
                     >
                        <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto px-4 mt-6">
                           Discover a smarter way to master English grammar like a native.
                           Achieve fluency with confidence and precision.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-8 w-full max-w-md mx-auto">
                          <Button asChild size="lg" className="h-14 px-8 md:px-10 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none group w-full sm:w-auto">
                            <Link to="/register" className="flex items-center justify-center gap-2">
                              Start Now <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="h-14 px-8 md:px-10 rounded-2xl text-lg font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 w-full sm:w-auto">
                            <Link to="/register">View Courses</Link>
                          </Button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8 md:pt-12">
                           <div className="flex -space-x-2">
                              {[1, 2, 3, 4].map(i => (
                                 <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white bg-slate-100" />
                              ))}
                           </div>
                           <p className="text-xs md:text-sm font-bold text-slate-400">Master English with our global community</p>
                        </div>
                     </motion.div>
                  </motion.div>
               </div>
            </section>

            {/* Features Showcase */}
            <section id="features" className="py-40 bg-white dark:bg-slate-900">
               <div className="max-w-6xl mx-auto px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                     <div className="space-y-10">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                           <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                           Personalized AI<br />
                           <span className="text-indigo-600">English Tutor.</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                           Our intelligent platform adapts to your level, helping you build vocabulary,
                           master grammar, and refine your speaking skills in real-time.
                        </p>
                        <div className="grid grid-cols-1 gap-5">
                           {[
                              'Adaptive Learning Paths',
                              'Real-time Grammar Correction',
                              'Conversational Practice Nodes'
                           ].map(text => (
                              <div key={text} className="flex items-center gap-4">
                                 <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                 <span className="text-lg font-bold text-slate-800">{text}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="relative">
                        <div className="absolute -inset-10 bg-indigo-50 rounded-full blur-[100px] opacity-40" />
                        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden relative bg-white dark:bg-slate-900">
                           <div className="h-10 bg-slate-50 dark:bg-slate-800 flex items-center gap-1.5 px-6 border-b border-slate-200 dark:border-slate-800">
                              <div className="h-2 w-2 rounded-full bg-slate-300" />
                              <div className="h-2 w-2 rounded-full bg-slate-300" />
                              <div className="h-2 w-2 rounded-full bg-slate-300" />
                           </div>
                           <CardContent className="p-10 space-y-8">
                              <div className="space-y-2">
                                 <div className="text-xs font-semibold text-slate-400">Example Input</div>
                                 <div className="text-xl font-bold text-slate-800 leading-snug">"I want to improve my speaking for a job interview."</div>
                              </div>

                              <div className="relative py-1">
                                 <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-100" />
                                 <div className="relative mx-auto h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                                    <Sparkles className="h-5 w-5 text-white" />
                                 </div>
                              </div>

                              <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-100 space-y-3">
                                 <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">AI Feedback</div>
                                 <div className="text-indigo-950 font-semibold text-lg leading-tight">
                                    "Excellent goal! Let's focus on <span className="text-indigo-600">Professional Etiquette</span> and <span className="text-indigo-600">Impactful Phrases</span>."
                                 </div>
                              </div>
                           </CardContent>
                        </Card>
                     </div>
                  </div>
               </div>
            </section>

            {/* Benefits Section */}
            <section className="py-40 bg-slate-50 dark:bg-slate-800/30">
               <div className="max-w-6xl mx-auto px-6">
                  <div className="text-center mb-24 space-y-4">
                     <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Why choose <span className="text-indigo-600">ENK?</span></h2>
                     <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Built for modern learners in a globalized world.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     {[
                        { title: 'Interactive Lessons', desc: 'Bite-sized content that fits your schedule, from beginner to advanced.', icon: BookOpen },
                        { title: 'Cultural Context', desc: 'Go beyond grammar. Learn how to express yourself naturally in any situation.', icon: Globe },
                        { title: 'Real Growth', desc: 'Track your progress with detailed analytics and personal milestones.', icon: TrendingUp }
                     ].map((feature, i) => (
                        <Card key={i} className="p-10 border-none shadow-sm rounded-xl bg-white dark:bg-slate-900 space-y-8 hover:shadow-xl transition-shadow duration-500">
                           <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600">
                              <feature.icon className="h-7 w-7" />
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                           </div>
                        </Card>
                     ))}
                  </div>
               </div>
            </section>

            {/* Call to Action */}
            <section className="py-64 px-6 text-center bg-white dark:bg-slate-900 relative overflow-hidden">
               <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
                     Ready to speak <br />
                     <span className="text-indigo-600">confidently?</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                     <Button asChild size="lg" className="h-18 px-14 rounded-full text-xl font-bold bg-indigo-600 text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-700 w-full sm:w-auto">
                       <Link to="/register">Create Your Account</Link>
                     </Button>
                  </div>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] opacity-30 -z-0" />
            </section>
         </main>

         <footer className="py-20 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
               <div className="flex items-center gap-3">
                  <div className="h-6 w-8 rounded bg-indigo-600 flex items-center justify-center text-white font-black text-[10px]">ENK</div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">ENK English</span>
               </div>
               <div className="flex flex-col md:items-end gap-2">
                  <p className="text-xs font-bold text-slate-400">Mastering English, naturally.</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 ENK English. All rights reserved.</p>
               </div>
            </div>
         </footer>
      </div>
   );
};
