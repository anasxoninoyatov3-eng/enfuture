import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseJsonLoose } from '../src/utils/aiParser';

const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_KEY || '');

async function callPollinations(systemInstruction: string, userPrompt: string) {
  const resp = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      jsonMode: true,
    }),
  });
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function callGroq(systemInstruction: string, userPrompt: string) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  const data = await resp.json();
  return data.choices[0].message.content;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, level, goal, language } = req.body;
  const langName = language === 'RU' ? 'Russian' : 'Uzbek';

  const systemInstruction = `You are the ENK Tutor, a friendly and expert English language teacher.
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
  "topic": "string",
  "level": "string",
  "goal": "string",
  "sections": [
    { "title": "string", "content": "string with markdown formatting", "type": "concept|exercise|summary|example" }
  ],
  "vocabulary": [
    { "term": "English word/phrase", "definition": "definition in ${langName}" }
  ],
  "sources": ["string"]
}`;

  const userPrompt = `Topic: "${topic}", Level: "${level}", Goal: "${goal}", Support Language: "${langName}"`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }]
    });

    const text = result.response.text();
    const lesson = parseJsonLoose(text);
    if (!lesson) throw new Error('Gemini JSON format rejected');
    return res.status(200).json({ lesson });
  } catch (error: any) {
    console.warn('Gemini failed, trying fallbacks:', error.message);
    try {
      const text = await (Math.random() > 0.5 ? callGroq(systemInstruction, userPrompt) : callPollinations(systemInstruction, userPrompt));
      const lesson = parseJsonLoose(text);
      if (!lesson) throw new Error('Fallback JSON format rejected');
      return res.status(200).json({ lesson });
    } catch (fallbackError: any) {
      console.warn('First fallback failed, trying second fallback:', fallbackError.message);
      try {
        const text = await callPollinations(systemInstruction, userPrompt);
        const lesson = parseJsonLoose(text);
        if (!lesson) throw new Error('Final fallback JSON format rejected');
        return res.status(200).json({ lesson });
      } catch (finalError: any) {
        console.error('All AI providers failed:', finalError);
        res.status(500).json({ error: 'AI xizmati vaqtincha mavjud emas. Iltimos keyinroq urinib ko\'ring.' });
      }
    }
  }
}
