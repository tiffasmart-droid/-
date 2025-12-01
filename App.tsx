
import React, { useState, useCallback, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import ReviewScreen from './components/ReviewScreen';
import { type QuizData, type Question } from './types';
import quizJson from './quiz-data.json';

enum QuizState {
  IDLE,
  IN_PROGRESS,
  COMPLETED,
  REVIEWING,
}

const FREQUENTLY_MISSED_THRESHOLD = 2;
const ERROR_HISTORY_KEY = 'quizErrorHistory';

const allQuestions: Question[] = quizJson.questions;
const quizTitle: string = quizJson.title;


const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(QuizState.IDLE);
  const [currentQuizData, setCurrentQuizData] = useState<QuizData | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [frequentlyMissedQuestions, setFrequentlyMissedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const processErrorHistory = useCallback((history: string[], questions: Question[]): Question[] => {
      const errorCounts = history.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const frequentErrorIds = Object.keys(errorCounts).filter(id => errorCounts[id] >= FREQUENTLY_MISSED_THRESHOLD);
      
      return questions.filter(q => frequentErrorIds.includes(q.id));
  }, []);

  useEffect(() => {
    // This effect now only loads error history from localStorage
    const savedHistory: string[] = JSON.parse(localStorage.getItem(ERROR_HISTORY_KEY) || '[]');
    const frequentQuestions = processErrorHistory(savedHistory, allQuestions);
    setFrequentlyMissedQuestions(frequentQuestions);
  }, [processErrorHistory]);


  const handleQuizStart = useCallback((data: QuizData) => {
    setCurrentQuizData(data);
    setQuizState(QuizState.IN_PROGRESS);
  }, []);

  const handleReviewStart = useCallback((data: QuizData) => {
    setCurrentQuizData(data);
    setQuizState(QuizState.REVIEWING);
  }, []);

  const handleQuizComplete = useCallback((score: number, incorrectQuestionIds: string[]) => {
    setIncorrectAnswers(incorrectQuestionIds);
    try {
        const savedHistory: string[] = JSON.parse(localStorage.getItem(ERROR_HISTORY_KEY) || '[]');
        const newHistory = [...savedHistory, ...incorrectQuestionIds];
        localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(newHistory));
        const frequentQuestions = processErrorHistory(newHistory, allQuestions);
        setFrequentlyMissedQuestions(frequentQuestions);
    } catch (e) {
        console.error("儲存錯誤紀錄失敗:", e);
    }
    setFinalScore(score);
    setQuizState(QuizState.COMPLETED);
  }, [processErrorHistory]);

  const handleReturnToStart = useCallback(() => {
    setCurrentQuizData(null);
    setFinalScore(0);
    setIncorrectAnswers([]);
    setQuizState(QuizState.IDLE);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const renderContent = () => {
    switch (quizState) {
      case QuizState.IN_PROGRESS:
        return currentQuizData && <QuizScreen quizData={currentQuizData} durationInSeconds={3600} onQuizComplete={handleQuizComplete} />;
      case QuizState.REVIEWING:
        return currentQuizData && <ReviewScreen quizData={currentQuizData} onBack={handleReturnToStart} />;
      case QuizState.COMPLETED:
        return currentQuizData && <ResultsScreen score={finalScore} quizData={currentQuizData} incorrectAnswers={incorrectAnswers} onRestart={handleReturnToStart} />;
      case QuizState.IDLE:
      default:
        const fullQuizData = { title: quizTitle, questions: allQuestions };
        return <StartScreen 
                  quizData={fullQuizData} 
                  frequentlyMissedQuestions={frequentlyMissedQuestions}
                  onQuizStart={handleQuizStart} 
                  onReviewStart={handleReviewStart} 
               />;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
