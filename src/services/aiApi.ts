import { GeneratedLesson, GeneratedQuiz, LearningGoal } from '@/types';
import { parseJsonLoose } from '@/utils/aiParser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Key from Environment Variables (GitHub Push Protection)
const GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function callGeminiDirect(
  systemInstruction: string,
  userPrompt: string,
  useJsonFormat = true
): Promise<string> {
  // 1. Try serverless backend generateContent endpoint first
  try {
    const response = await fetch('/api/generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ systemInstruction, userPrompt })
    });
    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    }
  } catch (err) {
    console.warn('Backend generateContent failed, trying direct Gemini client call:', err);
  }

  // 2. Fall back to client-side direct call
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: useJsonFormat ? "application/json" : "text/plain",
    }
  });

  const prompt = `${systemInstruction}\n\nUser Request: ${userPrompt}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

function getLessonSystemInstruction(language: 'RU' | 'UZ'): string {
  const langName = language === 'RU' ? 'Russian' : 'Uzbek';
  return `You are the ENK Tutor, a friendly and expert English language teacher.
Focus: Help students of all levels master English grammar, vocabulary, and conversation.
Adapt the teaching strategy based on the DIFFICULTY and GOAL.

STRUCTURE RULES:
1. NO GREETINGS. Start directly with the lesson content.
2. Give 4-6 sections.
3. Use Section Types: "concept", "exercise", "summary", "example".
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

function getQuizSystemInstruction(language: 'RU' | 'UZ'): string {
  const langName = language === 'RU' ? 'Russian' : 'Uzbek';
  return `You are a Quiz Generator for an English learning app.
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
Return ONLY valid JSON. Generate exactly 5 questions.`;
}

import { PREMADE_LESSONS } from '@/lessons';

export async function createLesson(
  topic: string,
  level: string,
  goal: LearningGoal,
  language: 'RU' | 'UZ'
): Promise<GeneratedLesson> {
  // 0. Check premade lessons repository
  const premadeKey = `${level}_${topic}`;
  const premadeMatch = PREMADE_LESSONS[premadeKey] || PREMADE_LESSONS[topic];
  
  // 1. Try backend serverless route first
  try {
    const response = await fetch('/api/createLesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic, level, goal, language })
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.lesson && data.lesson.sections && data.lesson.sections.length > 0) {
        return data.lesson;
      }
    }
  } catch (err) {
    console.warn('Backend createLesson failed, trying direct Gemini client call:', err);
  }

  // 2. Fall back to direct client-side generation
  try {
    const langName = language === 'RU' ? 'Russian' : 'Uzbek';
    const systemInstruction = getLessonSystemInstruction(language);
    const userPrompt = `Topic: "${topic}", Level: "${level}", Goal: "${goal}", Support Language: "${langName}"`;
    const text = await callGeminiDirect(systemInstruction, userPrompt, true);
    const parsed = parseJsonLoose<GeneratedLesson>(text);

    if (parsed?.sections?.length) return parsed;
  } catch (err) {
    console.warn('Gemini API call failed for lesson, using instant curriculum builder:', err);
  }

  // 3. If premade markdown exists, parse it into lesson sections
  if (premadeMatch && premadeMatch[language]) {
    const rawMarkdown = premadeMatch[language];
    const rawSections = rawMarkdown.split('---').map(s => s.trim()).filter(Boolean);
    const sections = rawSections.map((secStr, idx) => {
      const lines = secStr.split('\n');
      const titleLine = lines.find(l => l.startsWith('#')) || lines[0] || `Section ${idx + 1}`;
      const title = titleLine.replace(/^#+\s*/, '').trim();
      const content = lines.filter(l => !l.startsWith('#')).join('\n').trim();
      let type: any = 'concept';
      if (title.toLowerCase().includes('misol') || title.toLowerCase().includes('пример')) type = 'example';
      if (title.toLowerCase().includes('mashq') || title.toLowerCase().includes('упражнен')) type = 'exercise';
      if (title.toLowerCase().includes('test') || title.toLowerCase().includes('тест')) type = 'summary';

      return { title, content: content || secStr, type };
    });

    return {
      topic,
      level: level as any,
      goal,
      sections,
      vocabulary: [
        { term: topic, definition: language === 'RU' ? 'Тема урока' : 'Dars mavzusi' },
        { term: 'Example', definition: language === 'RU' ? 'Пример' : 'Misol' }
      ],
      sources: ['ENK Curriculum Database']
    };
  }

  // 4. Default Rich Educational Builder fallback (ensures lessons ALWAYS display)
  const isUz = language === 'UZ';
  return {
    topic: topic || 'English Topic',
    level: (level as any) || 'A1',
    goal,
    sections: [
      {
        title: isUz ? '📖 Nazariya va Qoidalar' : '📖 Теория и Правила',
        content: isUz
          ? `### **${topic}** bo'yicha asosiy tushunchalar\n\n- **Tavsif:** Usbu darsda siz **${topic}** mavzusining ingliz tilidagi qo'llanilishi va asosiy grammatik qoidalarini o'rganasiz.\n- **Ahamiyati:** ${level} darajadagi muloqot va yozuv ko'nikmalarini oshirish uchun juda muhim.`
          : `### Основные понятия по теме **${topic}**\n\n- **Описание:** В этом уроке вы изучите использование **${topic}** в английском языке и основные грамматические правила.\n- **Важность:** Очень важно для развития навыков общения и письма на уровне ${level}.`,
        type: 'concept'
      },
      {
        title: isUz ? '💡 Amaliy Misollar' : '💡 Практические Примеры',
        content: isUz
          ? `**1. Standart shakl:**\n- *Sample sentence for ${topic} in context.*\n- *(Izoh: Ushbu gapda ${topic} to'g'ri qo'llanilgan)*\n\n**2. Savol shakli:**\n- *How to form a question with ${topic}?*\n\n**3. Inkor shakli:**\n- *Negative structure example for ${topic}.*`
          : `**1. Стандартная форма:**\n- *Sample sentence for ${topic} in context.*\n- *(Примечание: В этом предложении ${topic} использовано правильно)*\n\n**2. Вопросительная форма:**\n- *How to form a question with ${topic}?*\n\n**3. Отрицательная форма:**\n- *Negative structure example for ${topic}.*`,
        type: 'example'
      },
      {
        title: isUz ? '✍️ Mustahkamlash Mashqlari' : '✍️ Упражнения для Закрепления',
        content: isUz
          ? `*Bo'sh o'rinlarni to'ldiring:*\n1. I usually _____ (${topic} in daily life).\n2. They _____ (not / understand) the rule yet.\n3. _____ you ever practiced ${topic}?`
          : `*Заполните пропуски:*\n1. I usually _____ (${topic} in daily life).\n2. They _____ (not / understand) the rule yet.\n3. _____ you ever practiced ${topic}?`,
        type: 'exercise'
      },
      {
        title: isUz ? '🎯 Xulosa va Maslahat' : '🎯 Итоги и Совет',
        content: isUz
          ? `**Xulosa:** ${topic} mavzusini mukammal o'zlashtirish uchun kunlik nutqda kamida 5 ta jumlada qo'llab ko'ring.`
          : `**Итог:** Чтобы отлично усвоить тему ${topic}, старайтесь использовать её минимум в 5 предложениях ежедневно.`,
        type: 'summary'
      }
    ],
    vocabulary: [
      { term: topic, definition: isUz ? 'Dars mavzusi' : 'Тема урока' },
      { term: 'Practice', definition: isUz ? 'Amaliyot' : 'Практика' },
      { term: 'Grammar', definition: isUz ? 'Grammatika' : 'Грамматика' }
    ],
    sources: ['ENK Smart Engine']
  };
}

export async function createQuiz(
  topic: string,
  level: string,
  language: 'RU' | 'UZ'
): Promise<GeneratedQuiz> {
  const langName = language === 'RU' ? 'Russian' : 'Uzbek';
  const systemInstruction = getQuizSystemInstruction(language);
  const userPrompt = "Create a comprehensive multiple-choice Practice Quiz covering the topic: " + topic + ". Level: " + level + ", Language: " + langName + ". Generate exactly 5 questions that test the main concepts of this topic.";

  try {
    const text = await callGeminiDirect(systemInstruction, userPrompt, true);
    const parsed = parseJsonLoose<GeneratedQuiz>(text);

    if (parsed?.questions?.length) return parsed;
  } catch (err) {
    console.error('Gemini API failed for quiz', err);
  }

  // Fallback Quiz if API fails
  const fallbackQuestion = language === 'RU'
    ? "Резервный вопрос для темы " + topic + ". (ИИ сервер недоступен)  "
    : topic + " bo'yicha zaxira savol. (AI server ishlamayapti)";

  return {
    topic: topic,
    questions: [
      {
        question: fallbackQuestion,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: "Server bilan bog'lanishda kichik muammo yuzaga keldi."
      }
    ]
  };
}

export async function generateContent(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  return callGeminiDirect(systemInstruction, userPrompt, false);
}

