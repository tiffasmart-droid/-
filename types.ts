export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  tags?: string[];
}

export interface QuizData {
  title: string;
  questions: Question[];
}
