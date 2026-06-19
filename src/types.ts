
export type KnowledgeLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LearningGoal = 'theoretical' | 'practical' | 'professional';

export interface VocabularyItem {
  term: string;
  definition: string;
}

export interface LessonSection {
  title: string;
  content: string;
  type: 'concept' | 'exercise' | 'summary' | 'example';
}

export interface GeneratedLesson {
  topic: string;
  level: KnowledgeLevel;
  goal: LearningGoal;
  sections: LessonSection[];
  vocabulary: VocabularyItem[];
  sources: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedQuiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface TopicProgress {
  topic: string;
  level: KnowledgeLevel;
  mastered: boolean;
  lastStudied: string | null;
  testScore: number | null;
  attempts: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  xp: number;
  streak: number;
  currentLevel: KnowledgeLevel;
  topicProgress: TopicProgress[];
  joinDate: string;
}
