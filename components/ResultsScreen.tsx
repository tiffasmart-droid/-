
import React, { useMemo } from 'react';
import { type QuizData } from '../types';

interface ResultsScreenProps {
  score: number;
  quizData: QuizData;
  incorrectAnswers: string[];
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, quizData, onRestart }) => {
  const totalQuestions = quizData.questions.length;
  
  const percentage = useMemo(() => {
    return totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  }, [score, totalQuestions]);

  const getFeedback = () => {
    if (percentage === 100) return "太完美了！ 🌟 您是這個領域的專家！";
    if (percentage >= 80) return "表現優異！ 🚀 您對內容瞭若指掌。";
    if (percentage >= 60) return "做得不錯！ 👍 稍加練習即可成為專家。";
    if (percentage >= 40) return "還可以，但有進步空間。繼續努力！ 💪";
    return "繼續學習！ 📚 每次嘗試都是進步。";
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 text-center">測驗完成！</h1>
      <p className="text-lg mb-6 text-gray-600 dark:text-gray-400 text-center">{getFeedback()}</p>
      
      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">總覽</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-indigo-600 dark:text-indigo-400"
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{transition: 'stroke-dasharray 0.5s ease-in-out'}}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{percentage}%</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{score} / {totalQuestions}</span>
                </div>
              </div>
              <div className="text-left text-sm">
                  <div className="flex items-center mb-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></span>
                    <span>答對: {score} 題</span>
                  </div>
                   <div className="flex items-center">
                    <span className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></span>
                    <span>答錯: {totalQuestions - score} 題</span>
                  </div>
              </div>
          </div>
      </div>
      
      <button
        onClick={onRestart}
        className="w-full px-6 py-3 mt-8 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 transform hover:scale-105"
      >
        返回主畫面
      </button>
    </div>
  );
};

export default ResultsScreen;
