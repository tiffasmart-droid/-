import React, { useState, useCallback, useEffect, useMemo } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import ReviewScreen from './components/ReviewScreen';
import { type QuizData, type Question } from './types';

enum QuizState {
  IDLE,
  IN_PROGRESS,
  COMPLETED,
  REVIEWING,
}

const FREQUENTLY_MISSED_THRESHOLD = 2;
const ERROR_HISTORY_KEY = 'quizErrorHistory';


const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(QuizState.IDLE);
  const [currentQuizData, setCurrentQuizData] = useState<QuizData | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const loadData = async () => {
      try {
        const response = await fetch('/quiz-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const processedQuestions = data.questions.map((q: any, index: number) => {
          const optionsRegex = /\([A-D]\)\s?/g;
          const questionParts = q.question.split(optionsRegex);
          const questionText = questionParts[0].trim();
          const options = questionParts.slice(1).map((opt: string) => opt.trim().replace(/。$/, ''));
          
          const answerIndex = q.answer.charCodeAt(0) - 65;
          const correctAnswerText = options[answerIndex] || q.answer;

          return {
            id: q.id || String(index + 1),
            question: questionText,
            options: options,
            answer: correctAnswerText,
            tags: q.tags || [],
          };
        });

        setAllQuestions(processedQuestions);
        setQuizTitle(data.title);

        const savedHistory: string[] = JSON.parse(localStorage.getItem(ERROR_HISTORY_KEY) || '[]');
        const frequentQuestions = processErrorHistory(savedHistory, processedQuestions);
        setFrequentlyMissedQuestions(frequentQuestions);
        
      } catch (e) {
        setError('無法載入題庫，請稍後再試。');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
  }, [allQuestions, processErrorHistory]);

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
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">正在載入題庫...</h1>
        </div>
      );
    }

    if (error) {
       return (
        <div className="text-center p-8 max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">發生錯誤</h1>
            <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>
        </div>
      );
    }

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