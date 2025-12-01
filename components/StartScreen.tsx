
import React, { useState, useMemo } from 'react';
import { type QuizData, type Question } from '../types';

interface StartScreenProps {
  quizData: QuizData;
  frequentlyMissedQuestions: Question[];
  onQuizStart: (data: QuizData) => void;
  onReviewStart: (data: QuizData) => void;
}

const shuffle = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const StartScreen: React.FC<StartScreenProps> = ({ quizData, frequentlyMissedQuestions, onQuizStart, onReviewStart }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => {
    if (!quizData) return [];
    const tags = new Set<string>();
    quizData.questions.forEach(q => {
      (q.tags && q.tags.length > 0 ? q.tags : ['未分類']).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort((a,b) => {
        if (a === '未分類') return 1;
        if (b === '未分類') return -1;
        return a.localeCompare(b);
    });
  }, [quizData]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const handleStartReview = () => {
    const filteredQuestions = selectedTags.size > 0
      ? quizData.questions.filter(q => 
          (q.tags && q.tags.length > 0 ? q.tags : ['未分類']).some(tag => selectedTags.has(tag))
        )
      : quizData.questions;

    if (filteredQuestions.length === 0) {
      setError("選擇的單元沒有對應的題目，請選擇其他單元或清除篩選。");
      return;
    }
    
    setError(null);
    onReviewStart({ ...quizData, questions: filteredQuestions });
  };
  
  const handleStartFrequentlyMissedReview = () => {
    onReviewStart({ title: "常錯問題複習", questions: frequentlyMissedQuestions });
  };

  const handleStartRandomTest = () => {
    const questions = shuffle(quizData.questions).slice(0, 50);
    setError(null);
    onQuizStart({ ...quizData, questions });
  };

  const handleStartUnitTest = () => {
    if (selectedTags.size === 0) {
      setError("請至少選擇一個單元來進行測驗。");
      return;
    }

    const filtered = quizData.questions.filter(q => 
      (q.tags && q.tags.length > 0 ? q.tags : ['未分類']).some(tag => selectedTags.has(tag))
    );

    if (filtered.length === 0) {
      setError("選擇的單元沒有對應的題目。");
      return;
    }

    const questions = shuffle(filtered).slice(0, 50);
    setError(null);
    onQuizStart({ ...quizData, questions });
  };

  if (!quizData || quizData.questions.length === 0) {
     return (
        <div className="text-center p-8">
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">題庫準備中...</h1>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">{quizData.title}</h1>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">總共 {quizData.questions.length} 題</p>
      </div>

      <div className="space-y-10">
        {frequentlyMissedQuestions.length > 0 && (
          <div className="p-6 bg-amber-50 dark:bg-amber-900/50 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-3">🎯 常錯問題</h3>
            <p className="text-sm text-amber-600 dark:text-amber-300 mb-4">您有 {frequentlyMissedQuestions.length} 題錯誤兩次以上，建議加強複習！</p>
            <button 
              onClick={handleStartFrequentlyMissedReview}
              className="px-6 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-800 transition-all duration-300 transform hover:scale-105"
            >
              複習常錯問題
            </button>
          </div>
        )}
      
        {allTags.length > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">1. 選擇單元 (選填)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">適用於「快速複習」和「單元測驗」。若不選擇，則預設為全部範圍。</p>
            <div className="flex flex-wrap justify-center gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors duration-200 ${selectedTags.has(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
              {selectedTags.size > 0 && (
                  <div className="text-center">
                    <button 
                        onClick={() => setSelectedTags(new Set())}
                        className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        清除篩選
                    </button>
                  </div>
              )}
          </div>
        )}
        
        <div >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">2. 選擇模式</h3>
            {error && <p className="mb-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={handleStartReview} className="w-full px-6 py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800 transition-all duration-300 transform hover:scale-105">
                <div className="text-xl">📚 快速複習</div>
                <div className="text-sm font-normal">顯示所有題目與答案</div>
              </button>
              <button onClick={handleStartRandomTest} className="w-full px-6 py-4 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 dark:focus:ring-sky-800 transition-all duration-300 transform hover:scale-105">
                <div className="text-xl">🎲 隨機測驗</div>
                <div className="text-sm font-normal">全範圍抽50題</div>
              </button>
               <button onClick={handleStartUnitTest} className="w-full px-6 py-4 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-4 focus:ring-fuchsia-300 dark:focus:ring-fuchsia-800 transition-all duration-300 transform hover:scale-105">
                <div className="text-xl">🎯 單元測驗</div>
                <div className="text-sm font-normal">從已選單元抽50題</div>
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
