
import React, { useState, useMemo } from 'react';
import { type QuizData, type Question } from '../types';

interface ReviewScreenProps {
  quizData: QuizData;
  onBack: () => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ quizData, onBack }) => {
  const { title, questions } = quizData;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categorizedQuestions = useMemo(() => {
    const categories: Record<string, Question[]> = {};
    questions.forEach(q => {
      const tags = q.tags && q.tags.length > 0 ? q.tags : ['未分類'];
      tags.forEach(tag => {
        if (!categories[tag]) {
          categories[tag] = [];
        }
        categories[tag].push(q);
      });
    });
    return categories;
  }, [questions]);

  const sortedCategories = useMemo(() => {
    return Object.keys(categorizedQuestions).sort((a, b) => {
        if (a === '未分類') return 1;
        if (b === '未分類') return -1;
        return a.localeCompare(b);
    });
  }, [categorizedQuestions]);

  const getOptionClasses = (option: string, answer: string) => {
    const baseClasses = 'w-full text-left p-3 my-1 rounded-lg border-2 text-base';
    if (option === answer) {
      return `${baseClasses} bg-green-100 dark:bg-green-800/60 border-green-500 dark:border-green-600 font-semibold text-green-800 dark:text-green-200`;
    }
    return `${baseClasses} bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600`;
  };

  const renderCategoryList = () => (
    <>
      <header className="mb-6 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400">快速複習模式 - 請選擇單元</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300"
          >
            返回主畫面
          </button>
        </div>
      </header>
      <div className="overflow-y-auto flex-grow pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="p-6 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="font-bold text-lg text-indigo-700 dark:text-indigo-300">{category}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{categorizedQuestions[category].length} 題</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderQuestionList = () => {
    if (!selectedCategory) return null;
    const questionsForCategory = categorizedQuestions[selectedCategory];

    return (
      <>
        <header className="mb-6 flex-shrink-0">
          <div className="flex justify-between items-center">
             <button onClick={() => setSelectedCategory(null)} className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-semibold p-2 -ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              返回單元列表
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300"
            >
              返回主畫面
            </button>
          </div>
           <div className="mt-4">
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{selectedCategory}</h1>
              <p className="text-gray-500 dark:text-gray-400">({questionsForCategory.length} 題)</p>
           </div>
        </header>
        <div className="space-y-6 overflow-y-auto flex-grow pr-2">
          {questionsForCategory.map((q, index) => (
            <div key={q.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <h2 className="text-lg font-semibold mb-3">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold mr-2">{index + 1}.</span>
                {q.question}
              </h2>
              <div>
                {q.options.map((option, optIndex) => (
                  <div key={optIndex} className={getOptionClasses(option, q.answer)}>
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="w-full max-w-4xl p-4 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col h-[90vh]">
      {selectedCategory ? renderQuestionList() : renderCategoryList()}
    </div>
  );
};

export default ReviewScreen;
