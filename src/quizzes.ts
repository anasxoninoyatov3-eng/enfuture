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
        options: ['am not', 'isn\'t', 'aren\'t'],
        correctIndex: 0,
        explanation: 'The negative of "I am" is "I am not".'
      }
    ]
  },
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
        explanation: 'We use Past Simple for actions that happened at a specific time in the past (yesterday).'
      },
      {
        question: 'How to make a negative sentence?',
        options: ['I not liked it.', 'I didn\'t liked it.', 'I didn\'t like it.'],
        correctIndex: 2,
        explanation: 'Negative sentences in Past Simple: subject + didn\'t + base verb.'
      },
      {
        question: 'Which is the correct question?',
        options: ['Did you watched TV?', 'Did you watch TV?', 'Do you watched TV?'],
        correctIndex: 1,
        explanation: 'Questions in Past Simple: Did + subject + base verb?'
      }
    ]
  },
  'Present Perfect vs Past Simple': {
    topic: 'Present Perfect vs Past Simple',
    level: 'B1',
    questions: [
      {
        question: 'Complete: "I ___ to Paris three times."',
        options: ['went', 'have been', 'have gone'],
        correctIndex: 1,
        explanation: 'Present Perfect is used for past experiences without a specific time (three times in my life).'
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
        explanation: 'Present Perfect is used when a past action has a result in the present (my finger hurts now).'
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
  }
};
