import { GeneratedLesson, GeneratedQuiz, LearningGoal } from '@/types';
import { parseJsonLoose } from '@/utils/aiParser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Key from Environment Variables (GitHub Push Protection)
const GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export function getSmartJoshFallback(userPrompt: string): string {
  let cleanInput = userPrompt;
  if (cleanInput.includes('Student:')) {
    const parts = cleanInput.split('Student:');
    cleanInput = parts[parts.length - 1].replace(/Josh:.*$/s, '').trim();
  }
  const text = cleanInput.toLowerCase().trim();

  // 1. Greetings & Introductions
  if (
    text.includes('salom') ||
    text.includes('assalom') ||
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey') ||
    text.includes('privet') ||
    text.includes('привет') ||
    text.includes('здравствуй')
  ) {
    return `Salom! 👋 Men **Josh** — sizning AI ingliz tili o'qituvchingizman!

Sizga quyidagi yo'nalishlarda yordam bera olaman:
- 📚 **Grammatika:** Zamolar, qoidalar va misollar
- 🗣️ **Muloqot:** Ingliz tilida so'zlashuv mashqi
- 📖 **Lug'at:** So'zlar va iboralar tarjimasi
- ✍️ **Test va mashqlar:** Bilimingizni sinash

Bugun qaysi mavzuni o'rganamiz yoki qanday savolingiz bor? 😊`;
  }

  if (
    text.includes('kimsan') ||
    text.includes('who are you') ||
    text.includes('isming') ||
    text.includes('кто ты') ||
    text.includes('как тебя зовут')
  ) {
    return `Men **Josh**man! 🎓 **ENK (Enfuture)** platformasining sun'iy intellektga asoslangan ingliz tili o'qituvchisiman. 

Mening maqsadim — sizga ingliz tilini o'rganishda doimiy hamroh bo'lish va barcha savollaringizga javob berish. Menga istalgan savolingizni berishingiz mumkin! 🚀`;
  }

  if (
    text.includes('qandaysan') ||
    text.includes('ishlar qanday') ||
    text.includes('how are you') ||
    text.includes('как дела')
  ) {
    return `Ajoyib, rahmat! 🌟 Doimo ingliz tili o'rganuvchilariga yordam berishga tayyorman. 

Sizning kayfiyatingiz va dars jarayonlaringiz qanday ketmoqda? Biror mavzuni takrorlaylikmi?`;
  }

  // 2. Grammar Tenses & Specific Topics
  if (text.includes('present simple') || text.includes('hozirgi oddiy')) {
    return `### 📘 Present Simple Tense (Hozirgi oddiy zamon)

**Qachon qo'llaniladi:** 
Har kuni, odatda sodir bo'ladigan takroriy harakatlar va umumiy haqiqatlarni ko'rsatish uchun.

**Formulasi:**
- **(+) I / You / We / They + V1**  *(e.g., I play football)*
- **(+) He / She / It + V1 + s/es** *(e.g., She plays football)*
- **(-) Subject + don't / doesn't + V1** *(e.g., He doesn't play)*
- **(?) Do / Does + Subject + V1?** *(e.g., Do you play?)*

**Kalit so'zlar:** always, usually, often, sometimes, everyday, every week.

💬 *Sinab ko'ring:* Siz har kuni nima qilasiz? Menga 1 ta Present Simple gap tuzib bering!`;
  }

  if (text.includes('present continuous') || text.includes('davomli') || text.includes('present progressive')) {
    return `### ⏱️ Present Continuous Tense (Hozirgi davomli zamon)

**Qachon qo'llaniladi:** 
Ayni damda (hozir) sodir bo'layotgan harakatlarni ifodalaydi.

**Formulasi:**
- **Subject + am / is / are + Verb-ing**

**Misollar:**
- I **am reading** a book right now. *(Men hozir kitob o'qiyapman)*
- She **is writing** an email. *(U xat yozyapti)*
- They **are playing** outside. *(Ular tashqarida o'ynashyapti)*

**Kalit so'zlar:** now, right now, at the moment, Look!, Listen!

💡 *Mashq:* Hozir nima qilyapsiz? English tili gap tuzib ko'ring-chi!`;
  }

  if (text.includes('past simple') || text.includes('o\'tgan oddiy') || text.includes('o’tgan oddiy') || text.includes('otgan oddiy')) {
    return `### 📜 Past Simple Tense (O'tgan oddiy zamon)

**Qachon qo'llaniladi:** 
O'tmishda sodir bo'lgan va tugallangan harakatlar uchun.

**Formulasi:**
- **(+) Subject + V2 (Ed)** *(e.g., I played / She went)*
- **(-) Subject + didn't + V1** *(e.g., I didn't play)*
- **(?) Did + Subject + V1?** *(e.g., Did you go?)*

**To'g'ri va Noto'g'ri Fe'llar:**
- Regular: *work ➔ worked*, *study ➔ studied*
- Irregular: *go ➔ went*, *see ➔ saw*, *buy ➔ bought*

**Kalit so'zlar:** yesterday, last week, ago, in 2020.

💬 *Savol:* Kecha nima qildingiz? Simple Past zamonida gap yozing!`;
  }

  if (text.includes('present perfect')) {
    return `### 🎯 Present Perfect Tense (Hozirgi tugallangan zamon)

**Qachon qo'llaniladi:** 
O'tmishda bajarilgan, lekin natijasi hozirda muhim bo'lgan yoki tajribani ko'rsatadigan zamon.

**Formulasi:**
- **Subject + have / has + V3 (Past Participle)**

**Misollar:**
- I **have finished** my homework. *(Men uyga vazifamni tugatdim — natijasi hozir tayyor)*
- She **has visited** London twice. *(U Londonda ikki marta bo'lgan — tajriba)*

**Kalit so'zlar:** already, yet, just, ever, never, since, for.

💡 *Mashq:* Siz hech Angliyada bo'lganmisiz? *"Have you ever..."* bilan savolga javob berib ko'ring!`;
  }

  if (text.includes('passive voice') || text.includes('majhul')) {
    return `### 🔄 Passive Voice (Majhul nisbat)

**Maqsadi:** Harakatni bajaruvchi emas, balki harakatning o'zi va ob'ekt muhim bo'lganda ishlatiladi.

**Formulasi:** 
- **Object + to be (am/is/are/was/were) + V3**

**Misol:**
- Active: *People build houses.* (Odamlar uylarni qurishadi)
- Passive: *Houses **are built** by people.* (Uylar odamlar tomonidan quriladi)

💬 Savolingiz bo'lsa bering, birgalikda misollar ko'ramiz!`;
  }

  if (text.includes('conditional') || text.includes('shart ergash') || text.includes(' if ')) {
    return `### 🔀 Conditionals (Shart gaplar)

Ingliz tilida 4 ta asosiy shart gap turi bor:

1. **Zero Conditional (Haqiqat/Qoida):** If + Present Simple, Present Simple  
   *If you heat ice, it melts.*
2. **First Conditional (Kelajakdagi imkoniyat):** If + Present Simple, Will + V1  
   *If it rains tomorrow, I will stay home.*
3. **Second Conditional (Noreal hozirgi holat):** If + Past Simple, Would + V1  
   *If I had a million dollars, I would buy a car.*
4. **Third Conditional (O'tgan afsuslanish):** If + Past Perfect, Would have + V3

Qaysi biriga chuqurroq misol ko'rishni xohlaysiz?`;
  }

  if (text.includes('modal') || text.includes('can') || text.includes('must') || text.includes('should')) {
    return `### ⚡ Modal Verbs (Ko'makchi fe'llar)

Modal fe'llar harakatga bo'lgan munosabatni (imkoniyat, majburiyat, maslahat) bildiradi:

- **Can / Could:** Qobiliyat va imkoniyat *(I can speak English)*
- **Must / Have to:** Majburiyat, shart *(You must wear a helmet)*
- **Should:** Maslahat berish *(You should sleep early)*
- **May / Might:** Ehtimollik *(It might rain today)*

Eslatma: Modal fe'llardan so'ng fe'lning o'zi (V1) keladi ('to' qo'yilmaydi).`;
  }

  // 3. Translation & Meaning queries
  if (
    text.includes('tarjima') ||
    text.includes('ma\'nosi') ||
    text.includes('means') ||
    text.includes('meaning') ||
    text.includes('lug\'at') ||
    text.includes('перевод') ||
    text.includes('so\'z')
  ) {
    return `### 🔤 Lug'at va Tarjima bo'yicha yordam

Menga qaysi so'z yoki iboraning tarjimasi kerakligini ayting! 

Masalan:
- *"Apple so'zining ma'nosi nima?"*
- *"I am learning English gapini tarjima qil"*

Sizga so'zning ma'nosi, talaffuzi va gapda ishlatilish misollarini ko'rsatib beraman! 📝`;
  }

  // 4. Practice / Quizzes / Exercises
  if (
    text.includes('test') ||
    text.includes('mashq') ||
    text.includes('quiz') ||
    text.includes('savol') ||
    text.includes('sinov')
  ) {
    return `### 🎯 Tezkor Test (Ingliz tili mashqi)

Quyidagi gapdagi bo'sh o'rinni to'ldiring:

> **"She ______ (study) English every day at 5 PM."**

**Variantlar:**
A) studying  
B) studies  
C) study  
D) is study  

Tog'ri javob variantini yozing (A, B, C yoki D) — men tekshirib beraman! 🤓`;
  }

  if (text === 'a' || text === 'b' || text === 'c' || text === 'd' || text.startsWith('b)')) {
    if (text.includes('b')) {
      return `🎉 **Barakalla! To'g'ri javob — B) studies!**

**Sababi:** *She* (u - uchinchi shaxs birlik) uchun Present Simple zamonida fe'lga **-es / -s** qo'shimchasi qo'shiladi (*study ➔ studies*).

Yana bir nechta test yechishni xohlaysizmi? 🚀`;
    } else {
      return `❌ **Afsuski, javob noto'g'ri.**

To'g'ri javob: **B) studies**.
**Tushuntirish:** *She* egalik olmoshi bilan Present Simple zamonida fe'lning oxiriga **-s / -es** qo'shiladi (*She studies*).

Yana bitta savol beraymi? 😊`;
    }
  }

  // 5. Advice / Learning Tips
  if (
    text.includes('qanday o\'rgansam') ||
    text.includes('maslahat') ||
    text.includes('ielts') ||
    text.includes('speaking') ||
    text.includes('maslahatlar')
  ) {
    return `### 💡 Ingliz tilini tez va samarali o'rganish bo'yicha 4 oltin maslahat:

1. 🎧 **Har kuni tinglang (Listening):** Podcastlar, YouTube videolar yoki inglizcha qo'shiqlar tinglang (kuniga 15-20 daqiqa).
2. 🗣️ **O'zingiz bilan gaplashing (Speaking):** O'ylayotgan fikrlaringizni ichingizda yoki ovoz chiqarib ingliz tilida aytishga harakat qiling.
3. 📖 **Har kuni 5 ta yangi so'z:** Yangi so'zlarni faqat o'zini emas, gap ichida kontekst bilan eslab qoling.
4. 🤖 **ENK AI platformasidan foydalaning:** Darslarni o'ting va men (Josh) bilan kunlik chatda muloqot qiling!

Birga mashq qilishni boshlaylikmi? Qaysi darajadasiz (A1, A2, B1...)?`;
  }

  // 6. Generic / Intelligent Contextual Response
  return `Tushundim! 👍 

Siz bergan savol yoki bildirilgan fikr bo'yicha:
Ingliz tilini mukammal egallash uchun muloqot va amaliyot eng muhim kalit hisoblanadi.

Menga quyidagilardan birini yuborishingiz mumkin:
- Qaysidir grammatik zamon yoki qoidani tushuntirish berishimni so'rang.
- Inglizcha biror gap yozing, men grammatikasini tekshirib beraman.
- Biror so'zning tarjimasini so'rang.

Sizga qanday yordam bera olaman? 😊`;
}

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

  // 2. Fall back to client-side direct call if API key is present
  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          responseMimeType: useJsonFormat ? "application/json" : "text/plain",
        }
      });

      const prompt = `${systemInstruction}\n\nUser Request: ${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      if (text) return text;
    } catch (error: any) {
      console.warn('Gemini API direct call error:', error?.message || error);
    }
  }

  // 3. Fallback handling
  if (!useJsonFormat) {
    return getSmartJoshFallback(userPrompt);
  }

  throw new Error('Gemini API generation unavailable');
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

import { PREMADE_QUIZZES } from '@/quizzes';

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function createSmartQuestion(
  question: string,
  correctOption: string,
  wrongOptions: string[],
  explanation: string
) {
  const allOptions = [correctOption, ...wrongOptions];
  const shuffled = [...allOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const correctIndex = shuffled.indexOf(correctOption);
  return {
    question,
    options: shuffled,
    correctIndex,
    explanation
  };
}

function generateSmartFallbackQuiz(
  topic: string,
  level: string,
  language: 'RU' | 'UZ'
): GeneratedQuiz {
  const isUz = language === 'UZ';
  return {
    topic: topic,
    questions: [
      createSmartQuestion(
        `Which option correctly uses "${topic}" in a sentence?`,
        `She successfully applied "${topic}" in daily conversation.`,
        [
          `They did not understood the proper grammar form.`,
          `She are studying English every morning.`,
          `He don't know how to use this rule.`
        ],
        isUz
          ? `Grammatik jihatdan to'g'ri berilgan variant: "${topic}" mavzusining to'g'ri qo'llanilishi.`
          : `Грамматически верный вариант использования темы "${topic}".`
      ),
      createSmartQuestion(
        `Choose the grammatically correct structure for "${topic}":`,
        `How is this rule applied in standard English?`,
        [
          `Why you not practice this topic?`,
          `Where she goes yesterday?`,
          `What you are doing now?`
        ],
        isUz
          ? `Ingliz tilida so'roq gaplarda yordamchi fe'l egadan oldinga o'tadi.`
          : `В вопросительных предложениях вспомогательный глагол ставится перед подлежащим.`
      ),
      createSmartQuestion(
        `What is the main function of "${topic}"?`,
        `To express ideas and actions according to standard ${level} level grammar rules.`,
        [
          `To change the spelling of nouns randomly.`,
          `To replace all past tense verbs with present tense.`,
          `It has no specific function in English.`
        ],
        isUz
          ? `${topic} mavzusi ${level} darajadagi muloqotda asosiy grammatik va semantik vazifani bajaradi.`
          : `Тема ${topic} выполняет ключевую грамматическую функцию для уровня ${level}.`
      ),
      createSmartQuestion(
        `Which structure is most frequently associated with "${topic}"?`,
        `Contextual key indicator or auxiliary verb`,
        [
          `Random adjective without noun`,
          `Plural noun suffix only`,
          `Silent letters`
        ],
        isUz
          ? `Mavzuni to'g'ri me'yorida qo'llash uchun mos kalit so'zlar va ko'makchi fe'llardan foydalaniladi.`
          : `Для правильного использования используются соответствующие ключевые слова и глаголы.`
      ),
      createSmartQuestion(
        `Complete the sentence: "By practicing ${topic} every day, you ___ your English fluency."`,
        `will significantly improve`,
        [
          `improving never`,
          `has improve`,
          `did improved`
        ],
        isUz
          ? `Kelasi zamon natijasini ko'rsatish uchun "will improve" shakli to'g'ri keladi.`
          : `Для выражения будущего результата правильно использовать "will improve".`
      )
    ]
  };
}

export async function createQuiz(
  topic: string,
  level: string,
  language: 'RU' | 'UZ'
): Promise<GeneratedQuiz> {
  // 1. Check PREMADE_QUIZZES database first with normalized matching
  const normSearch = normalizeString(topic);
  const premadeMatchKey = Object.keys(PREMADE_QUIZZES).find(k => {
    const normK = normalizeString(k);
    return normK === normSearch || normK.includes(normSearch) || normSearch.includes(normK);
  });

  if (premadeMatchKey && PREMADE_QUIZZES[premadeMatchKey]?.questions?.length) {
    return {
      topic: topic,
      questions: PREMADE_QUIZZES[premadeMatchKey].questions
    };
  }

  // 2. Try Gemini API generation
  const langName = language === 'RU' ? 'Russian' : 'Uzbek';
  const systemInstruction = getQuizSystemInstruction(language);
  const userPrompt = "Create a comprehensive multiple-choice Practice Quiz covering the topic: " + topic + ". Level: " + level + ", Language: " + langName + ". Generate exactly 5 questions that test the main concepts of this topic.";

  try {
    const text = await callGeminiDirect(systemInstruction, userPrompt, true);
    const parsed = parseJsonLoose<GeneratedQuiz>(text);

    if (parsed?.questions?.length && parsed.questions.length >= 3) return parsed;
  } catch (err) {
    console.error('Gemini API failed for quiz generation:', err);
  }

  // 3. Smart High-Quality Quiz Fallback (never shows broken fallback text)
  return generateSmartFallbackQuiz(topic, level, language);
}

export async function generateContent(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  return callGeminiDirect(systemInstruction, userPrompt, false);
}

