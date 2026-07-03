import { GeneratedLesson, GeneratedQuiz, LearningGoal } from '@/types';
import { parseJsonLoose } from '@/utils/aiParser';

const GROQ_API_KEY = (import.meta as any).env.VITE_GROQ_API_KEY_LESSON || '';

async function callGroqDirect(
  systemInstruction: string,
  userPrompt: string,
  useJsonFormat = true
): Promise<string> {
  const payload: Record<string, unknown> = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  };

  if (useJsonFormat) {
    payload.response_format = { type: 'json_object' };
  }

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    let errMsg = `API xatosi: ${resp.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.error?.message || errMsg;
    } catch {
      /* ignore */
    }
    throw new Error(errMsg);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('AI javob bermadi');
  return text;
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

export async function createLesson(
  topic: string,
  level: string,
  goal: LearningGoal,
  language: 'RU' | 'UZ'
): Promise<GeneratedLesson> {
  try {
    const resp = await fetch('/api/createLesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, goal, language }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.lesson?.sections?.length) return data.lesson as GeneratedLesson;
    }
  } catch (e) {
    console.warn('createLesson API unavailable, using direct fallback', e);
  }

  try {
    const langName = language === 'RU' ? 'Russian' : 'Uzbek';
    const systemInstruction = getLessonSystemInstruction(language);
    const userPrompt = `Topic: "${topic}", Level: "${level}", Goal: "${goal}", Support Language: "${langName}"`;
    const text = await callGroqDirect(systemInstruction, userPrompt, true);
    const parsed = parseJsonLoose<GeneratedLesson>(text);
  
    if (parsed?.sections?.length) return parsed;
  } catch (err) {
    console.error('Groq AI API failed for lesson', err);
  }

  // Fallback if all APIs fail (ensures the error is NEVER shown to the user)
  return {
    topic: topic || 'English Topic',
    level: (level as any) || 'A1',
    goal,
    sections: [
      {
        title: language === 'RU' ? 'Введение' : 'Kirish',
        content: language === 'RU' 
          ? `Это резервный урок для темы **${topic}**. Мы временно не смогли подключиться к ИИ-серверу для генерации полного урока. Пожалуйста, проверьте настройки API.` 
          : `Bu **${topic}** mavzusi uchun zaxira (vaqtinchalik) dars oynasi. Sun'iy intellekt serveriga vaqtincha ulana olmadik. API kalitlarini yoki internetni tekshiring.`,
        type: 'concept'
      },
      {
        title: language === 'RU' ? 'Примеры' : 'Misollar',
        content: `- Example one for ${topic}\n- Example two for ${topic}`,
        type: 'example'
      }
    ],
    vocabulary: [
      { term: 'Fallback', definition: language === 'RU' ? 'Резервный вариант' : 'Zaxira varianti' },
      { term: 'Error', definition: language === 'RU' ? 'Ошибка' : 'Xatolik' }
    ],
    sources: ['System Fallback']
  };
}

export async function createQuiz(
  topic: string,
  level: string,
  language: 'RU' | 'UZ'
): Promise<GeneratedQuiz> {
  const langName = language === 'RU' ? 'Russian' : 'Uzbek';
  const systemInstruction = getQuizSystemInstruction(language);
  const userPrompt = `Create a comprehensive multiple-choice Practice Quiz covering the topic: "${topic}".
Level: "${level}", Language: "${langName}". Generate exactly 5 questions that test the main concepts of this topic.`;

  try {
    const resp = await fetch('/api/generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, userPrompt }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseJsonLoose<GeneratedQuiz>(text);
      if (parsed?.questions?.length) return parsed;
    }
  } catch (e) {
    console.warn('generateContent API unavailable, using direct fallback', e);
  }

  try {
    const text = await callGroqDirect(systemInstruction, userPrompt, true);
    const parsed = parseJsonLoose<GeneratedQuiz>(text);
  
    if (parsed?.questions?.length) return parsed;
  } catch (err) {
    console.error('Groq AI API failed for quiz', err);
  }

  // Fallback Quiz if API fails
  return {
    topic: topic,
    questions: [
      {
        question: language === 'RU' 
          ? `Резервный вопрос для темы ${topic}. (ИИ сервер недоступен)` 
          : `${topic} bo'yicha zaxira savol. (AI server ishlamayapti)`,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: 'Server bilan bog\'lanishda kichik muammo yuzaga keldi.'
      }
    ]
  };
}

export async function generateContent(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  try {
    const resp = await fetch('/api/generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, userPrompt }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text;
    }
  } catch (e) {
    console.warn('generateContent API unavailable, using direct fallback', e);
  }

  return callGroqDirect(systemInstruction, userPrompt, false);
}
