export const PREMADE_QUIZZES: Record<string, {
  topic: string;
  level: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}> = {
  // ===== A1 =====
  'The Verb "to be" (am, is, are)': {
    topic: 'The Verb "to be" (am, is, are)',
    level: 'A1',
    questions: [
      {
        question: 'Which form of "to be" is correct? "I ___ a student."',
        options: ['am', 'is', 'are'],
        correctIndex: 0,
        explanation: 'We use "am" only with the pronoun "I".'
      },
      {
        question: 'Complete: "She ___ a doctor."',
        options: ['am', 'is', 'are'],
        correctIndex: 1,
        explanation: 'We use "is" with he, she, and it.'
      },
      {
        question: 'Which is correct? "We ___ from Uzbekistan."',
        options: ['am', 'is', 'are'],
        correctIndex: 2,
        explanation: 'We use "are" with we, you, and they.'
      },
      {
        question: 'How to make a question correctly?',
        options: ['You are a teacher?', 'Are you a teacher?', 'Is you a teacher?'],
        correctIndex: 1,
        explanation: 'In questions, we invert the subject and verb: "Are you...?"'
      },
      {
        question: 'What is the negative form? "I ___ tired."',
        options: ['am not', "isn't", "aren't"],
        correctIndex: 0,
        explanation: 'The negative of "I am" is "I am not".'
      }
    ]
  },

  'Present Simple Tense': {
    topic: 'Present Simple Tense',
    level: 'A1',
    questions: [
      {
        question: 'She ___ to school every day.',
        options: ['go', 'goes', 'going'],
        correctIndex: 1,
        explanation: 'With he, she, it — add -s or -es to the verb in Present Simple.'
      },
      {
        question: 'They ___ not like coffee.',
        options: ['do', 'does', 'is'],
        correctIndex: 0,
        explanation: 'With they/we/you/I — use "do" in negative sentences.'
      },
      {
        question: '___ he play football?',
        options: ['Do', 'Does', 'Is'],
        correctIndex: 1,
        explanation: 'Use "Does" to ask questions with he/she/it.'
      },
      {
        question: 'I ___ English every morning.',
        options: ['study', 'studies', 'studying'],
        correctIndex: 0,
        explanation: 'With "I" — use the base form of the verb.'
      },
      {
        question: 'The sun ___ in the east.',
        options: ['rise', 'rises', 'rose'],
        correctIndex: 1,
        explanation: 'Present Simple is used for facts. "The sun rises" — rises (third person).'
      }
    ]
  },

  'Personal & Possessive Pronouns': {
    topic: 'Personal & Possessive Pronouns',
    level: 'A1',
    questions: [
      {
        question: 'This is ___ book. (Ali\'s book)',
        options: ['he', 'his', 'him'],
        correctIndex: 1,
        explanation: '"His" is a possessive pronoun used before nouns.'
      },
      {
        question: '___ are my friends.',
        options: ['They', 'Them', 'Their'],
        correctIndex: 0,
        explanation: '"They" is a subject pronoun used as the subject of a sentence.'
      },
      {
        question: 'The cat licked ___ paws.',
        options: ['it', 'its', "it's"],
        correctIndex: 1,
        explanation: '"Its" (no apostrophe) is the possessive form for it.'
      },
      {
        question: 'Give the book to ___.',
        options: ['she', 'her', 'hers'],
        correctIndex: 1,
        explanation: 'After a preposition (to, for, with), use object pronouns: me, him, her, us, them.'
      },
      {
        question: 'This is not your pen. It is ___.',
        options: ['my', 'me', 'mine'],
        correctIndex: 2,
        explanation: '"Mine" is an independent possessive pronoun (no noun after it).'
      }
    ]
  },

  'Countable & Uncountable Nouns': {
    topic: 'Countable & Uncountable Nouns',
    level: 'A1',
    questions: [
      {
        question: 'Which is uncountable?',
        options: ['apple', 'water', 'book'],
        correctIndex: 1,
        explanation: '"Water" is uncountable — we cannot say "one water, two waters".'
      },
      {
        question: '___ milk in the fridge.',
        options: ['There are', 'There is', 'There have'],
        correctIndex: 1,
        explanation: 'Uncountable nouns use singular "there is".'
      },
      {
        question: 'I need ___ information.',
        options: ['an', 'a', 'some'],
        correctIndex: 2,
        explanation: '"Information" is uncountable — use "some" not "a/an".'
      },
      {
        question: 'How ___ chairs are in this room?',
        options: ['much', 'many', 'few'],
        correctIndex: 1,
        explanation: '"How many" is used with countable nouns.'
      },
      {
        question: 'How ___ money do you have?',
        options: ['much', 'many', 'few'],
        correctIndex: 0,
        explanation: '"How much" is used with uncountable nouns.'
      }
    ]
  },

  'Basic Prepositions (in, on, at)': {
    topic: 'Basic Prepositions (in, on, at)',
    level: 'A1',
    questions: [
      {
        question: 'I live ___ Tashkent.',
        options: ['in', 'on', 'at'],
        correctIndex: 0,
        explanation: '"In" is used for cities, countries, and enclosed spaces.'
      },
      {
        question: 'The meeting is ___ Monday.',
        options: ['in', 'on', 'at'],
        correctIndex: 1,
        explanation: '"On" is used for days of the week.'
      },
      {
        question: 'She wakes up ___ 7 o\'clock.',
        options: ['in', 'on', 'at'],
        correctIndex: 2,
        explanation: '"At" is used for specific times.'
      },
      {
        question: 'The book is ___ the table.',
        options: ['in', 'on', 'at'],
        correctIndex: 1,
        explanation: '"On" is used for surfaces.'
      },
      {
        question: 'I was born ___ 2000.',
        options: ['in', 'on', 'at'],
        correctIndex: 0,
        explanation: '"In" is used for years and months.'
      }
    ]
  },

  // ===== A2 =====
  'Past Simple Tense': {
    topic: 'Past Simple Tense',
    level: 'A2',
    questions: [
      {
        question: 'What is the Past Simple of "play"?',
        options: ['plaied', 'played', 'playd'],
        correctIndex: 1,
        explanation: 'Regular verbs add "-ed" to form the Past Simple.'
      },
      {
        question: 'What is the Past Simple of "go"?',
        options: ['goed', 'went', 'gone'],
        correctIndex: 1,
        explanation: '"Go" is an irregular verb. Its Past Simple form is "went".'
      },
      {
        question: 'Complete: "I ___ football yesterday."',
        options: ['play', 'played', 'playing'],
        correctIndex: 1,
        explanation: 'We use Past Simple for actions that happened at a specific time in the past.'
      },
      {
        question: 'How to make a negative sentence?',
        options: ["I not liked it.", "I didn't liked it.", "I didn't like it."],
        correctIndex: 2,
        explanation: "Negative sentences in Past Simple: subject + didn't + base verb."
      },
      {
        question: 'Which is the correct question?',
        options: ['Did you watched TV?', 'Did you watch TV?', 'Do you watched TV?'],
        correctIndex: 1,
        explanation: 'Questions in Past Simple: Did + subject + base verb?'
      }
    ]
  },

  'Present Continuous': {
    topic: 'Present Continuous',
    level: 'A2',
    questions: [
      {
        question: 'She ___ a book right now.',
        options: ['reads', 'is reading', 'read'],
        correctIndex: 1,
        explanation: 'Present Continuous = am/is/are + verb-ing. Used for actions happening now.'
      },
      {
        question: 'They ___ football at the moment.',
        options: ['play', 'are playing', 'played'],
        correctIndex: 1,
        explanation: '"They" uses "are" + verb-ing for Present Continuous.'
      },
      {
        question: 'I ___ (not/work) today.',
        options: ["I'm not working", "I not working", "I don't work"],
        correctIndex: 0,
        explanation: 'Negative Present Continuous: am/is/are + not + verb-ing.'
      },
      {
        question: '___ you listening to me?',
        options: ['Do', 'Are', 'Is'],
        correctIndex: 1,
        explanation: '"You" uses "Are" in questions with Present Continuous.'
      },
      {
        question: 'Which sentence uses Present Continuous correctly?',
        options: ['I am knowing the answer.', 'I am running in the park.', 'She is have a car.'],
        correctIndex: 1,
        explanation: '"Know" and "have" are stative verbs — not normally used in continuous forms.'
      }
    ]
  },

  'Comparatives & Superlatives': {
    topic: 'Comparatives & Superlatives',
    level: 'A2',
    questions: [
      {
        question: 'Mount Everest is ___ mountain in the world.',
        options: ['higher', 'highest', 'the highest'],
        correctIndex: 2,
        explanation: 'Superlatives use "the + adjective + -est" for short adjectives.'
      },
      {
        question: 'This test is ___ than yesterday\'s.',
        options: ['more difficult', 'most difficult', 'difficulter'],
        correctIndex: 0,
        explanation: 'Long adjectives form comparatives with "more + adjective".'
      },
      {
        question: 'She is ___ than her sister.',
        options: ['tall', 'taller', 'tallest'],
        correctIndex: 1,
        explanation: 'Comparative = short adjective + -er (taller).'
      },
      {
        question: '"Good" — what is the comparative?',
        options: ['gooder', 'more good', 'better'],
        correctIndex: 2,
        explanation: '"Good" is irregular: good → better → best.'
      },
      {
        question: 'He speaks English ___ than I do.',
        options: ['more fluent', 'more fluently', 'fluenter'],
        correctIndex: 1,
        explanation: 'Adverbs form comparatives with "more + adverb".'
      }
    ]
  },

  'Future with "going to"': {
    topic: 'Future with "going to"',
    level: 'A2',
    questions: [
      {
        question: 'I ___ visit my grandparents tomorrow.',
        options: ["am going to", "is going to", "are going to"],
        correctIndex: 0,
        explanation: '"I" uses "am going to" for future plans.'
      },
      {
        question: 'She ___ study medicine.',
        options: ['am going to', 'is going to', 'are going to'],
        correctIndex: 1,
        explanation: '"She" (third person singular) uses "is going to".'
      },
      {
        question: 'Look at those clouds! It ___ rain.',
        options: ['is going to', 'will', 'goes to'],
        correctIndex: 0,
        explanation: '"Going to" is used for predictions based on evidence (clouds = rain).'
      },
      {
        question: 'They ___ not play basketball today.',
        options: ["aren't going to", "isn't going to", "don't going to"],
        correctIndex: 0,
        explanation: '"They" uses "aren\'t going to" for negative future.'
      },
      {
        question: '___ you going to buy a new phone?',
        options: ['Is', 'Am', 'Are'],
        correctIndex: 2,
        explanation: '"You" uses "Are" in questions with "going to".'
      }
    ]
  },

  'Basic Modal Verbs (can, must, should)': {
    topic: 'Basic Modal Verbs (can, must, should)',
    level: 'A2',
    questions: [
      {
        question: 'I ___ swim very well.',
        options: ['can', 'must', 'should'],
        correctIndex: 0,
        explanation: '"Can" expresses ability or capability.'
      },
      {
        question: 'You ___ see a doctor. You look very ill.',
        options: ['can', 'must', 'should'],
        correctIndex: 2,
        explanation: '"Should" gives advice or recommendation.'
      },
      {
        question: 'Students ___ wear uniforms at school.',
        options: ['can', 'must', 'should'],
        correctIndex: 1,
        explanation: '"Must" expresses obligation or necessity.'
      },
      {
        question: '___ I use your pen?',
        options: ['Can', 'Must', 'Should'],
        correctIndex: 0,
        explanation: '"Can" is used to ask for permission.'
      },
      {
        question: 'You ___ smoke here. It\'s forbidden.',
        options: ['should not', 'cannot', 'must not'],
        correctIndex: 2,
        explanation: '"Must not" (mustn\'t) expresses prohibition.'
      }
    ]
  },

  // ===== B1 =====
  'Present Perfect vs Past Simple': {
    topic: 'Present Perfect vs Past Simple',
    level: 'B1',
    questions: [
      {
        question: 'Complete: "I ___ to Paris three times."',
        options: ['went', 'have been', 'have gone'],
        correctIndex: 1,
        explanation: 'Present Perfect is used for past experiences without a specific time.'
      },
      {
        question: 'Complete: "I ___ to Paris last year."',
        options: ['went', 'have been', 'have gone'],
        correctIndex: 0,
        explanation: 'Past Simple is used when there is a specific time in the past (last year).'
      },
      {
        question: 'Complete: "___ you ever eaten sushi?"',
        options: ['Did', 'Have', 'Has'],
        correctIndex: 1,
        explanation: 'We use Present Perfect with "ever" to ask about past experiences.'
      },
      {
        question: 'Complete: "Ouch! I ___ my finger!"',
        options: ['cut', 'have cut', 'cutted'],
        correctIndex: 1,
        explanation: 'Present Perfect is used when a past action has a result in the present.'
      },
      {
        question: 'When do we use Past Simple?',
        options: [
          'For actions with a result in the present',
          'For actions at a specific time in the past',
          'For actions that continue to the present'
        ],
        correctIndex: 1,
        explanation: 'Past Simple focuses on when something happened (specific time in the past).'
      }
    ]
  },

  'Past Continuous': {
    topic: 'Past Continuous',
    level: 'B1',
    questions: [
      {
        question: 'I ___ TV when she called.',
        options: ['watched', 'was watching', 'am watching'],
        correctIndex: 1,
        explanation: 'Past Continuous (was/were + -ing) shows an ongoing action interrupted by another.'
      },
      {
        question: 'They ___ football all afternoon.',
        options: ['played', 'were playing', 'are playing'],
        correctIndex: 1,
        explanation: '"They" uses "were + -ing" for Past Continuous.'
      },
      {
        question: 'While I ___ , the phone rang.',
        options: ['sleep', 'was sleeping', 'slept'],
        correctIndex: 1,
        explanation: '"While" clause uses Past Continuous for the background action.'
      },
      {
        question: '___ it raining when you left?',
        options: ['Was', 'Were', 'Did'],
        correctIndex: 0,
        explanation: '"It" uses "Was" in Past Continuous questions.'
      },
      {
        question: 'She ___ not listening to the teacher.',
        options: ['was', 'were', 'did'],
        correctIndex: 0,
        explanation: '"She" uses "was not (wasn\'t)" for negative Past Continuous.'
      }
    ]
  },

  'First & Second Conditionals': {
    topic: 'First & Second Conditionals',
    level: 'B1',
    questions: [
      {
        question: 'If it ___, I will stay at home.',
        options: ['rains', 'will rain', 'rained'],
        correctIndex: 0,
        explanation: 'First Conditional: If + Present Simple, will + base verb (real/possible situation).'
      },
      {
        question: 'If I ___ a million dollars, I would travel the world.',
        options: ['have', 'had', 'will have'],
        correctIndex: 1,
        explanation: 'Second Conditional: If + Past Simple, would + base verb (unreal/imaginary).'
      },
      {
        question: 'If she studies hard, she ___ the exam.',
        options: ['passed', 'will pass', 'would pass'],
        correctIndex: 1,
        explanation: 'First Conditional result clause uses "will + base verb".'
      },
      {
        question: 'Which is Second Conditional?',
        options: [
          'If it rains, I will take an umbrella.',
          'If I were you, I would apologize.',
          'When I grow up, I will be a doctor.'
        ],
        correctIndex: 1,
        explanation: 'Second Conditional uses "were" and "would" for hypothetical situations.'
      },
      {
        question: 'If I ___ you, I would not do that.',
        options: ['am', 'was', 'were'],
        correctIndex: 2,
        explanation: 'In Second Conditional, "were" is used for all persons (formal/standard).'
      }
    ]
  },

  'Passive Voice (Present & Past)': {
    topic: 'Passive Voice (Present & Past)',
    level: 'B1',
    questions: [
      {
        question: 'English ___ all over the world.',
        options: ['speaks', 'is spoken', 'was spoken'],
        correctIndex: 1,
        explanation: 'Present Simple Passive: is/are + past participle.'
      },
      {
        question: 'The Eiffel Tower ___ in 1889.',
        options: ['built', 'was built', 'is built'],
        correctIndex: 1,
        explanation: 'Past Simple Passive: was/were + past participle.'
      },
      {
        question: 'The letters ___ every morning.',
        options: ['delivered', 'are delivered', 'were delivered'],
        correctIndex: 1,
        explanation: 'Present Simple Passive for regular actions.'
      },
      {
        question: 'The window ___ by the storm.',
        options: ['broke', 'was broken', 'has broken'],
        correctIndex: 1,
        explanation: 'Past Simple Passive for completed actions in the past.'
      },
      {
        question: 'How do we form the passive voice?',
        options: [
          'Subject + verb + object',
          'Subject + to be + past participle',
          'Subject + have + past participle'
        ],
        correctIndex: 1,
        explanation: 'Passive = form of "to be" + past participle (V3).'
      }
    ]
  },

  '"Used to" and Past Habits': {
    topic: '"Used to" and Past Habits',
    level: 'B1',
    questions: [
      {
        question: 'I ___ smoke, but I quit 5 years ago.',
        options: ['used to', 'use to', 'was used to'],
        correctIndex: 0,
        explanation: '"Used to" describes past habits that no longer continue.'
      },
      {
        question: '___ you use to play video games as a child?',
        options: ['Used', 'Did', 'Were'],
        correctIndex: 1,
        explanation: 'Questions with "used to" use "Did + subject + use to".'
      },
      {
        question: 'She ___ live in London, but now she lives in Paris.',
        options: ['used to', 'uses to', 'use to'],
        correctIndex: 0,
        explanation: '"Used to" for all subjects (no -s in third person).'
      },
      {
        question: 'He ___ not use to like vegetables.',
        options: ["didn't used to", "didn't use to", "wasn't used to"],
        correctIndex: 1,
        explanation: 'Negative: "didn\'t use to" (no -d after "use").'
      },
      {
        question: 'What does "used to" express?',
        options: [
          'An action happening right now',
          'A past habit or state that has changed',
          'A future plan'
        ],
        correctIndex: 1,
        explanation: '"Used to" describes repeated past actions or states that no longer exist.'
      }
    ]
  },

  // ===== B2 =====
  'Present Perfect Continuous': {
    topic: 'Present Perfect Continuous',
    level: 'B2',
    questions: [
      {
        question: 'I ___ for two hours. (work)',
        options: ['have been working', 'have worked', 'was working'],
        correctIndex: 0,
        explanation: 'Present Perfect Continuous: have/has + been + verb-ing. Shows duration.'
      },
      {
        question: 'She ___ all day. She\'s exhausted. (clean)',
        options: ['has been cleaning', 'has cleaned', 'cleaned'],
        correctIndex: 0,
        explanation: 'PPC shows an ongoing activity with a present result (she\'s tired).'
      },
      {
        question: 'How long ___ you learning English?',
        options: ['have', 'did', 'were'],
        correctIndex: 0,
        explanation: '"How long have you been..." asks about the duration up to now.'
      },
      {
        question: 'Why are your eyes red? — I ___ (cry).',
        options: ["I've cried", "I've been crying", 'I was crying'],
        correctIndex: 1,
        explanation: 'PPC explains a present state caused by a recent continuous activity.'
      },
      {
        question: 'PPC vs Present Perfect: which is correct?',
        options: [
          '"I have read this book" = I just finished it.',
          '"I have been reading this book" = I just finished it.',
          '"I have been read this book" = I read it many times.'
        ],
        correctIndex: 0,
        explanation: 'Present Perfect (have + V3) emphasizes completion. PPC emphasizes the process/duration.'
      }
    ]
  },

  'Third Conditional': {
    topic: 'Third Conditional',
    level: 'B2',
    questions: [
      {
        question: 'If I ___ harder, I would have passed.',
        options: ['studied', 'had studied', 'would study'],
        correctIndex: 1,
        explanation: 'Third Conditional: If + Past Perfect, would have + past participle.'
      },
      {
        question: 'She ___ the train if she had left earlier.',
        options: ['would catch', 'would have caught', 'had caught'],
        correctIndex: 1,
        explanation: 'Result clause in Third Conditional: would/could have + past participle.'
      },
      {
        question: 'What does Third Conditional express?',
        options: [
          'A real possibility in the present',
          'An unreal action in the future',
          'An unreal situation in the past'
        ],
        correctIndex: 2,
        explanation: 'Third Conditional talks about imaginary past situations and their hypothetical results.'
      },
      {
        question: 'If they ___ the map, they would not have got lost.',
        options: ['check', 'had checked', 'checked'],
        correctIndex: 1,
        explanation: '"If" clause in Third Conditional: had + past participle.'
      },
      {
        question: 'Complete: "I wouldn\'t have been tired if I ___ to bed earlier."',
        options: ['went', 'go', 'had gone'],
        correctIndex: 2,
        explanation: 'Past Perfect (had + V3) in the "if" clause.'
      }
    ]
  },

  'Reported Speech': {
    topic: 'Reported Speech',
    level: 'B2',
    questions: [
      {
        question: 'He said, "I am tired." → He said that he ___ tired.',
        options: ['is', 'was', 'were'],
        correctIndex: 1,
        explanation: 'Backshift: Present Simple → Past Simple in reported speech.'
      },
      {
        question: 'She said, "I will help you." → She said that she ___ help me.',
        options: ['will', 'would', 'should'],
        correctIndex: 1,
        explanation: 'Backshift: "will" → "would" in reported speech.'
      },
      {
        question: '"Don\'t touch that!" → She told me not ___ that.',
        options: ['to touch', 'touch', 'touched'],
        correctIndex: 0,
        explanation: 'Reported imperatives use "to + infinitive".'
      },
      {
        question: '"Are you ready?" → He asked if I ___ ready.',
        options: ['am', 'was', 'were'],
        correctIndex: 1,
        explanation: 'Reported Yes/No questions: asked if/whether + backshifted tense.'
      },
      {
        question: 'He said, "I have finished." → He said he ___.',
        options: ['has finished', 'had finished', 'finished'],
        correctIndex: 1,
        explanation: 'Backshift: Present Perfect → Past Perfect in reported speech.'
      }
    ]
  },

  'Future Perfect & Continuous': {
    topic: 'Future Perfect & Continuous',
    level: 'B2',
    questions: [
      {
        question: 'By 2030, scientists ___ a cure for this disease.',
        options: ['will find', 'will have found', 'will be finding'],
        correctIndex: 1,
        explanation: 'Future Perfect: will have + V3 — completed before a future point.'
      },
      {
        question: 'At 8pm, I ___ dinner. Please don\'t call.',
        options: ['will have eat', 'will be eating', 'will eat'],
        correctIndex: 1,
        explanation: 'Future Continuous: will + be + -ing — ongoing action at a future moment.'
      },
      {
        question: 'By the time you arrive, I ___ all the food.',
        options: ['will eat', 'will have eaten', 'will be eating'],
        correctIndex: 1,
        explanation: '"By the time" signals Future Perfect — completed before another future event.'
      },
      {
        question: 'This time next year, she ___ in New York.',
        options: ['will live', 'will have lived', 'will be living'],
        correctIndex: 2,
        explanation: '"This time next year" signals Future Continuous — action in progress at a future time.'
      },
      {
        question: 'He ___ with the company for 20 years by December.',
        options: ['will work', 'will be working', 'will have been working'],
        correctIndex: 2,
        explanation: 'Future Perfect Continuous: will + have + been + -ing — duration up to a future point.'
      }
    ]
  },

  'Modal Verbs for Deduction': {
    topic: 'Modal Verbs for Deduction',
    level: 'B2',
    questions: [
      {
        question: 'She knows every street in the city. She ___ live here for a long time.',
        options: ['must', 'might', 'can\'t'],
        correctIndex: 0,
        explanation: '"Must" for deduction — you are almost certain something is true.'
      },
      {
        question: 'I\'m not sure, but he ___ be at home.',
        options: ['must', 'might', "can't"],
        correctIndex: 1,
        explanation: '"Might/may" expresses possibility — you are not sure.'
      },
      {
        question: 'That ___ be Ali. He\'s in London!',
        options: ["mustn't", "might not", "can't"],
        correctIndex: 2,
        explanation: '"Can\'t" for deduction — you are almost certain something is impossible.'
      },
      {
        question: 'She ___ be tired. She slept for 10 hours.',
        options: ["can't", 'might', 'must'],
        correctIndex: 0,
        explanation: '"Can\'t" — logically impossible to be tired after 10 hours of sleep.'
      },
      {
        question: 'He ___ be a doctor. He knows so much about medicine.',
        options: ['might', 'must', "can't"],
        correctIndex: 1,
        explanation: '"Must" — strong certainty based on evidence.'
      }
    ]
  },

  // ===== C1 =====
  'Mixed Conditionals': {
    topic: 'Mixed Conditionals',
    level: 'C1',
    questions: [
      {
        question: 'If I had studied medicine, I ___ a doctor now.',
        options: ['would be', 'would have been', 'will be'],
        correctIndex: 0,
        explanation: 'Mixed: If + Past Perfect (past) → would + base form (present result).'
      },
      {
        question: 'If she ___ more disciplined, she would have finished the project.',
        options: ['were', 'had been', 'would be'],
        correctIndex: 0,
        explanation: 'Mixed: If + Past Simple/were (present character) → would have + V3 (past result).'
      },
      {
        question: 'I ___ speak French now if I had taken classes.',
        options: ['could', 'could have', 'had could'],
        correctIndex: 0,
        explanation: '"Could" (present ability) in the result clause of a mixed conditional.'
      },
      {
        question: 'Which sentence is a mixed conditional?',
        options: [
          'If it rains, I will stay home.',
          'If I had won the lottery, I would buy a house.',
          'If I had invested, I would be rich now.'
        ],
        correctIndex: 2,
        explanation: 'Mixed conditional: past action (had invested) → present state (would be rich now).'
      },
      {
        question: 'If she weren\'t so shy, she ___ applied for the job.',
        options: ['would', 'would have', 'had'],
        correctIndex: 1,
        explanation: 'Mixed: present habit (weren\'t shy) → past result (would have applied).'
      }
    ]
  },

  'Inversion for Emphasis': {
    topic: 'Inversion for Emphasis',
    level: 'C1',
    questions: [
      {
        question: 'Never ___ I seen such beauty.',
        options: ['had', 'have', 'has'],
        correctIndex: 1,
        explanation: 'After "Never" at the start, invert subject and auxiliary: Never have I...'
      },
      {
        question: 'Not only ___ he late, but also rude.',
        options: ['was', 'is', 'were'],
        correctIndex: 0,
        explanation: '"Not only" followed by inverted auxiliary + subject.'
      },
      {
        question: 'Hardly ___ sat down when the phone rang.',
        options: ['had I', 'I had', 'have I'],
        correctIndex: 0,
        explanation: '"Hardly" triggers inversion: Hardly had I + past participle...'
      },
      {
        question: 'Under no circumstances ___ you open this door.',
        options: ['should', 'you should', 'do you'],
        correctIndex: 0,
        explanation: 'Negative adverbials like "Under no circumstances" trigger inversion.'
      },
      {
        question: 'Why is inversion used in formal English?',
        options: [
          'To make sentences shorter',
          'To add emphasis or formality',
          'To simplify grammar'
        ],
        correctIndex: 1,
        explanation: 'Inversion adds emphasis, formality, and stylistic effect to sentences.'
      }
    ]
  },

  'Advanced Passive Structures': {
    topic: 'Advanced Passive Structures',
    level: 'C1',
    questions: [
      {
        question: 'They say that he is a genius. → It ___ that he is a genius.',
        options: ['is said', 'says', 'was said'],
        correctIndex: 0,
        explanation: 'Passive reporting: It is said / reported / believed + that...'
      },
      {
        question: 'The project is expected ___ next month.',
        options: ['completing', 'to complete', 'to be completed'],
        correctIndex: 2,
        explanation: 'Passive infinitives: expected/believed + to be + past participle.'
      },
      {
        question: 'He ___ to have stolen the money.',
        options: ['is alleged', 'alleges', 'alleged'],
        correctIndex: 0,
        explanation: '"Is alleged to have + past participle" — reporting unproven claims.'
      },
      {
        question: 'He is known ___ several languages.',
        options: ['speaking', 'to speak', 'to be spoken'],
        correctIndex: 1,
        explanation: 'Passive with "to + infinitive": is known to speak (active infinitive).'
      },
      {
        question: 'The results will be announced. → What is the subject of this passive?',
        options: ['Someone', 'The results', 'announced'],
        correctIndex: 1,
        explanation: 'In passive voice, the object of the active sentence becomes the subject.'
      }
    ]
  },

  'Gerunds vs Infinitives': {
    topic: 'Gerunds vs Infinitives',
    level: 'C1',
    questions: [
      {
        question: 'I enjoy ___ to music.',
        options: ['listen', 'to listen', 'listening'],
        correctIndex: 2,
        explanation: '"Enjoy" is always followed by a gerund (verb + -ing).'
      },
      {
        question: 'She decided ___ abroad.',
        options: ['studying', 'to study', 'study'],
        correctIndex: 1,
        explanation: '"Decide" is followed by an infinitive (to + base verb).'
      },
      {
        question: 'I remember ___ her before. (past memory)',
        options: ['meeting', 'to meet', 'meet'],
        correctIndex: 0,
        explanation: '"Remember + gerund" refers to a memory of a past action.'
      },
      {
        question: 'He tried ___ the window. (an experiment/attempt)',
        options: ['opening', 'to open', 'open'],
        correctIndex: 0,
        explanation: '"Try + gerund" means trying something as an experiment. "Try + infinitive" means making an effort.'
      },
      {
        question: 'Stop ___ in class!',
        options: ['to talk', 'talk', 'talking'],
        correctIndex: 2,
        explanation: '"Stop + gerund" means ceasing an action. "Stop + infinitive" means stopping to do something else.'
      }
    ]
  },

  'Cleft Sentences': {
    topic: 'Cleft Sentences',
    level: 'C1',
    questions: [
      {
        question: '"Ali broke the window." → It was Ali ___ broke the window.',
        options: ['who', 'which', 'that'],
        correctIndex: 0,
        explanation: 'It-cleft for people: "It was + person + who..."'
      },
      {
        question: '"I need a holiday." → What I need ___ a holiday.',
        options: ['is', 'are', 'was'],
        correctIndex: 0,
        explanation: 'Wh-cleft (pseudo-cleft): "What + clause + is/are + focus".'
      },
      {
        question: 'It was London ___ I first fell in love.',
        options: ['who', 'where', 'which'],
        correctIndex: 1,
        explanation: 'Cleft for places uses "where".'
      },
      {
        question: 'Why do we use cleft sentences?',
        options: [
          'To make sentences passive',
          'To emphasize a particular part of a sentence',
          'To ask questions indirectly'
        ],
        correctIndex: 1,
        explanation: 'Cleft sentences split a sentence into two clauses to add emphasis.'
      },
      {
        question: '"She called me on Monday." (emphasize "Monday") → It was ___ that she called me.',
        options: ['Monday', 'on Monday', 'at Monday'],
        correctIndex: 1,
        explanation: 'In it-clefts, prepositions are kept with the focused element.'
      }
    ]
  },

  // ===== C2 =====
  'The Subjunctive Mood': {
    topic: 'The Subjunctive Mood',
    level: 'C2',
    questions: [
      {
        question: 'The committee recommended that he ___ the position.',
        options: ['accepts', 'accept', 'accepted'],
        correctIndex: 1,
        explanation: 'Mandative subjunctive: base form (no -s) after recommend/suggest/demand + that.'
      },
      {
        question: 'If I ___ you, I would not do that.',
        options: ['am', 'was', 'were'],
        correctIndex: 2,
        explanation: '"Were" in subjunctive for hypothetical wishes/conditions (all persons).'
      },
      {
        question: 'It is essential that she ___ on time.',
        options: ['arrives', 'arrive', 'is arriving'],
        correctIndex: 1,
        explanation: 'After "it is essential/imperative/vital that" — use subjunctive (base form).'
      },
      {
        question: 'God ___ the Queen!',
        options: ['saves', 'save', 'saved'],
        correctIndex: 1,
        explanation: 'Formulaic subjunctive (fixed expressions): "God save", "Long live", "Heaven forbid".'
      },
      {
        question: 'I wish I ___ fly.',
        options: ['can', 'could', 'might'],
        correctIndex: 1,
        explanation: '"Wish + could/would" for unreal wishes about the present/future.'
      }
    ]
  },

  'Narrative Tenses (Advanced)': {
    topic: 'Narrative Tenses (Advanced)',
    level: 'C2',
    questions: [
      {
        question: 'By the time they arrived, she ___ already.',
        options: ['left', 'had left', 'was leaving'],
        correctIndex: 1,
        explanation: 'Past Perfect for completed actions before another past event.'
      },
      {
        question: 'As he ___ down the street, he saw an old friend.',
        options: ['walked', 'was walking', 'had walked'],
        correctIndex: 1,
        explanation: 'Past Continuous for background scene-setting in narrative.'
      },
      {
        question: 'She ___ of moving abroad for years before she finally did.',
        options: ['thought', 'was thinking', 'had been thinking'],
        correctIndex: 2,
        explanation: 'Past Perfect Continuous for prolonged actions leading up to a past event.'
      },
      {
        question: 'Which creates the best narrative effect?',
        options: [
          'He walked, he saw, he conquered.',
          'As he was walking, he suddenly saw them — he had never expected this.',
          'He walks and sees them.'
        ],
        correctIndex: 1,
        explanation: 'Mixing narrative tenses creates suspense and shows temporal relationships.'
      },
      {
        question: '"She opened the door. She screamed." What does this imply?',
        options: [
          'She screamed before opening the door.',
          'She screamed while opening the door.',
          'She screamed immediately after opening the door.'
        ],
        correctIndex: 2,
        explanation: 'Past Simple sequences events in chronological order.'
      }
    ]
  },

  'Advanced Idioms & Expressions': {
    topic: 'Advanced Idioms & Expressions',
    level: 'C2',
    questions: [
      {
        question: '"Bite the bullet" means:',
        options: [
          'To eat very fast',
          'To endure a painful situation with courage',
          'To shoot something'
        ],
        correctIndex: 1,
        explanation: '"Bite the bullet" = endure something difficult or unpleasant.'
      },
      {
        question: '"It\'s raining cats and dogs" means:',
        options: [
          'Animals are falling from the sky',
          'It\'s raining very heavily',
          'There is a thunderstorm'
        ],
        correctIndex: 1,
        explanation: '"Raining cats and dogs" = raining very hard.'
      },
      {
        question: '"The ball is in your court" means:',
        options: [
          'You are playing tennis',
          'It is your turn / your decision to make',
          'You missed an opportunity'
        ],
        correctIndex: 1,
        explanation: '"The ball is in your court" = it\'s your responsibility to act next.'
      },
      {
        question: '"Hit the nail on the head" means:',
        options: [
          'To make a mistake',
          'To describe exactly what is correct',
          'To start a construction project'
        ],
        correctIndex: 1,
        explanation: '"Hit the nail on the head" = to say or describe something exactly right.'
      },
      {
        question: '"Let the cat out of the bag" means:',
        options: [
          'To free an animal',
          'To reveal a secret accidentally',
          'To solve a difficult problem'
        ],
        correctIndex: 1,
        explanation: '"Let the cat out of the bag" = accidentally reveal a secret.'
      }
    ]
  },

  'Complex Clauses & Participles': {
    topic: 'Complex Clauses & Participles',
    level: 'C2',
    questions: [
      {
        question: '___ the report, she noticed several errors.',
        options: ['Reading', 'Read', 'Having read'],
        correctIndex: 0,
        explanation: 'Present participle (-ing) shows simultaneous action with the main clause.'
      },
      {
        question: '___ the exam, he felt relieved.',
        options: ['Finishing', 'Having finished', 'Finished'],
        correctIndex: 1,
        explanation: '"Having + past participle" shows an action completed before the main action.'
      },
      {
        question: 'The man ___ in the garden is my uncle.',
        options: ['standing', 'to stand', 'stood'],
        correctIndex: 0,
        explanation: 'Participial phrase "standing in the garden" modifies "the man".'
      },
      {
        question: 'Which sentence contains a reduced relative clause?',
        options: [
          'The woman who is sitting there is my boss.',
          'The woman sitting there is my boss.',
          'The woman, she is sitting there, is my boss.'
        ],
        correctIndex: 1,
        explanation: '"The woman sitting there" is a reduced relative clause (who is → removed).'
      },
      {
        question: 'Given the circumstances, ___ impossible to meet the deadline.',
        options: ['it was', 'was it', 'there was'],
        correctIndex: 0,
        explanation: '"Given" is a participial adjective. "It was" correctly follows the clause.'
      }
    ]
  },

  'Discourse Markers': {
    topic: 'Discourse Markers',
    level: 'C2',
    questions: [
      {
        question: 'The weather was terrible. ___, we had a great time.',
        options: ['Therefore', 'Nevertheless', 'Furthermore'],
        correctIndex: 1,
        explanation: '"Nevertheless" = despite that. Shows contrast/concession.'
      },
      {
        question: 'He is intelligent. ___, he works very hard.',
        options: ['Moreover', 'However', 'Although'],
        correctIndex: 0,
        explanation: '"Moreover" adds additional information supporting the same point.'
      },
      {
        question: '___, I would like to say a few words about today\'s topic.',
        options: ['In addition', 'To begin with', 'Consequently'],
        correctIndex: 1,
        explanation: '"To begin with" introduces the first point in formal discourse.'
      },
      {
        question: 'She forgot her passport. ___, she missed the flight.',
        options: ['However', 'As a result', 'In contrast'],
        correctIndex: 1,
        explanation: '"As a result" shows cause and effect.'
      },
      {
        question: 'Which discourse marker shows concession?',
        options: ['Furthermore', 'Admittedly', 'Subsequently'],
        correctIndex: 1,
        explanation: '"Admittedly" concedes a point while still maintaining the overall argument.'
      }
    ]
  }
};
