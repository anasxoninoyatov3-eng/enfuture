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
        { role: 'system', content: (systemInstruction || '') },
        { role: 'user', content: userPrompt },
      ],
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
        { role: 'system', content: (systemInstruction || '') },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  const data = await resp.json();
  return data.choices[0].message.content;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { systemInstruction, userPrompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: (systemInstruction ? systemInstruction + "\n\n" : "") + userPrompt }] }
      ]
    });

    const responseData = {
      candidates: [{ content: { parts: [{ text: result.response.text() }] } }]
    };

    res.status(200).json(responseData);
  } catch (error: any) {
    console.warn('Gemini failed, trying fallbacks:', error.message);
    try {
      const text = await (Math.random() > 0.5 ? callGroq(systemInstruction, userPrompt) : callPollinations(systemInstruction, userPrompt));
      // No need to parseJsonLoose here as we return the candidates structure with raw text
      const responseData = {
        candidates: [{ content: { parts: [{ text: text }] } }]
      };
      res.status(200).json(responseData);
    } catch (fallbackError: any) {
      console.warn('First fallback fallback failed, trying second fallback:', fallbackError.message);
      try {
        const text = await callPollinations(systemInstruction, userPrompt);
        const responseData = {
          candidates: [{ content: { parts: [{ text: text }] } }]
        };
        res.status(200).json(responseData);
      } catch (finalError: any) {
        console.error('All AI providers failed:', finalError);
        res.status(500).json({ error: finalError.message || 'Internal Server Error' });
      }
    }
  }
}
