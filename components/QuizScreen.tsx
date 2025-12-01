
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type QuizData, type Question } from '../types';
import { CheckIcon, CrossIcon } from './Icons';

interface QuizScreenProps {
  quizData: QuizData;
  durationInSeconds: number;
  onQuizComplete: (score: number, incorrectQuestionIds: string[]) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ quizData, durationInSeconds, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectQuestionIds, setIncorrectQuestionIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>(quizData.questions);
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);

  const { title } = quizData;

  useEffect(() => {
    setQuestions(quizData.questions);
  }, [quizData]);
  
  const handleSubmit = useCallback(() => {
    onQuizComplete(score, incorrectQuestionIds);
  }, [score, incorrectQuestionIds, onQuizComplete]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmit]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === currentQuestion.answer) {
      setScore(prevScore => prevScore + 1);
    } else {
      setIncorrectQuestionIds(prev => [...prev, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleSubmit();
    }
  };

  const progressPercentage = useMemo(() => {
    if (totalQuestions === 0) return 0;
    const answeredCount = isAnswered ? currentQuestionIndex + 1 : currentQuestionIndex;
    return (answeredCount / totalQuestions) * 100;
  }, [currentQuestionIndex, totalQuestions, isAnswered]);

  const getOptionClasses = (option: string) => {
    let baseClasses = 'w-full text-left p-4 my-2 rounded-lg border-2 transition-all duration-300 text-lg flex items-center justify-between';
    
    if (!isAnswered) {
      return `${baseClasses} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer`;
    }

    const isCorrect = option === currentQuestion.answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return `${baseClasses} bg-green-100 dark:bg-green-900/50 border-green-500 cursor-not-allowed`;
    }
    if (isSelected && !isCorrect) {
      return `${baseClasses} bg-red-100 dark:bg-red-900/50 border-red-500 cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-70`;
  };
  
  const getIcon = (option: string) => {
    if (!isAnswered) return null;
    const isCorrect = option === currentQuestion.answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) return <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />;
    if (isSelected && !isCorrect) return <CrossIcon className="h-6 w-6 text-red-600 dark:text-red-400" />;
    return null;
  };

  if (questions.length === 0 || !currentQuestion) {
    return (
        <div className="w-full max-w-3xl p-4 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            <p>這個單元沒有題目，或是測驗已完成。</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-3xl p-4 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-transform hover:scale-[1.01] duration-500">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{title}</h1>
        <div className="grid grid-cols-3 items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="text-left">題目 {currentQuestionIndex + 1} / {totalQuestions}</span>
          <span className="text-center font-mono text-xl text-red-500 dark:text-red-400 font-bold">{formatTime(timeLeft)}</span>
          <span className="text-right">分數: {score}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
          <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </header>
      
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 leading-relaxed">{currentQuestion.question}</h2>
        <div>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(option)}
              disabled={isAnswered}
              className={getOptionClasses(option)}
            >
              <span>{String.fromCharCode(65 + index)}. {option}</span>
              {getIcon(option)}
            </button>
          ))}
        </div>
      </div>

      <footer className="flex justify-between items-center">
        <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all duration-300"
          >
            送出測驗
        </button>
        {isAnswered && (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 transform hover:scale-105"
          >
            {currentQuestionIndex < totalQuestions - 1 ? '下一題' : '完成測驗'}
          </button>
        )}
      </footer>
    </div>
  );
};

export default QuizScreen;
