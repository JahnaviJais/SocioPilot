import React from 'react';

const Loading = () => (
  <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center max-w-md mx-auto space-y-4">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-purple-500 rounded-full mx-auto animate-spin"></div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
      Analyzing your content
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      This might take a few moments
    </p>
  </div>
);

export default Loading;
