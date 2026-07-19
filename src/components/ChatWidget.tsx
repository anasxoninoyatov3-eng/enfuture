import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn, speakText } from '@/utils';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Salom! 👋 Men Josh — sizning AI ingliz tili o\'qituvchingizman. Grammatika, lug\'at yoki ingliz tilini yaxshilash bo\'yicha savollar bering!\n\nПривет! Я Джош — ваш AI учитель английского. Спрашивайте о грамматике, лексике или как улучшить свой английский!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      // Also stop any playing audio elements
      document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; });
      setSpeakingId(null);
      return;
    }

    setSpeakingId(msgId);
    speakText(text, () => setSpeakingId(null), 'uz');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const systemInstruction = `You are Josh, a helpful, friendly and enthusiastic AI assistant and teacher.

LANGUAGE RULES:
- You can communicate in ANY language requested by the user.
- Always reply in the same language the user uses.
- If the user asks for an explanation of a topic, provide it in their language.

CONCISENESS RULES:
- Keep your explanations very brief and concise.
- Use bullet points or short sentences.
- Only give the most important information.
- Aim for 1-2 short paragraphs or a few bullet points.

YOUR PERSONALITY:
- Be warm, encouraging, and patient.
- Use emojis occasionally.
- Keep responses easy to understand.`;

      // We use Gemini API via generateContent
      // Need to format chat history as text because generateContent uses raw text.
      const conversationHistory = messages.map(m => `${m.role === 'user' ? 'Student' : 'Josh'}: ${m.content}`).join('\n\n');
      const userPrompt = `${conversationHistory}\n\nStudent: ${userText}\n\nJosh:`;

      const { generateContent } = await import('@/services/aiApi');
      const output = await generateContent(systemInstruction, userPrompt);

      const newMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: newMsgId,
        role: 'assistant',
        content: output || 'Kechirasiz, muammo yuz berdi.'
      }]);

      if (autoSpeak) {
        setTimeout(() => {
          setSpeakingId(newMsgId);
          speakText(output, () => setSpeakingId(null), 'uz');
        }, 300);
      }

    } catch (err: any) {
      console.error(err);
      let errorMsg = `⚠️ Xatolik yuz berdi: ${err.message || 'API bilan bog\'lanishda xato'}. API kalitni tekshiring.`;
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-indigo-600 shadow-xl shadow-indigo-600/30 flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all relative"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 right-0 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="h-16 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3 text-white">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Josh (AI Teacher)</div>
                    <div className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Auto-speak toggle */}
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      autoSpeak ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"
                    )}
                    title={autoSpeak ? "Ovozli javob yoqilgan / Голосовой ответ включён" : "Ovozli javob o'chirilgan / Голосовой ответ выключен"}
                  >
                    {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0f172a]"
              >
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === 'user'
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700/50 rounded-bl-sm"
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-slate dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>

                    {/* Voice button for AI messages */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all",
                            speakingId === msg.id
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                          )}
                          title="Tinglab ko'rish / Послушать"
                        >
                          {speakingId === msg.id ? (
                            <><VolumeX className="h-3 w-3" /> Stop</>
                          ) : (
                            <><Volume2 className="h-3 w-3" /> 🎧</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex w-full justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                      <div className="flex gap-1">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="h-2 w-2 rounded-full bg-indigo-400" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="h-2 w-2 rounded-full bg-indigo-400" />
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="h-2 w-2 rounded-full bg-indigo-400" />
                      </div>
                      <span className="text-xs text-slate-400 ml-1">Josh yozmoqda...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Xabar yozing... / Напишите сообщение..."
                    className="flex-1 h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
