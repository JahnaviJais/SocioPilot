// src/components/ResultCard.jsx - Updated with your design

import { FileText, Sparkles, Copy, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

const ResultCard = ({ result }) => {
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedInsights, setCopiedInsights] = useState(false);
  const [copiedSuggestions, setCopiedSuggestions] = useState(false);

  const handleCopy = (text, setFlag) => {
    navigator.clipboard.writeText(text);
    setFlag(true);
    setTimeout(() => setFlag(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
      {/* Extracted Text */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 text-white">
        <div className="flex items-center justify-between mb-4 border-b border-gray-600 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h3 className="text-lg font-semibold">Extracted Text</h3>
          </div>
          <button
            onClick={() => handleCopy(result.extractedText, setCopiedContent)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-full hover:scale-105 transition-transform"
          >
            <Copy size={16} />
            {copiedContent ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto p-4 bg-gray-700 rounded-md">
          <p className="text-sm whitespace-pre-wrap">{result.extractedText}</p>
        </div>
      </div>

      {/* Post Insights */}
      {result.postInsights && (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4 border-b border-gray-600 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Post Insights</h3>
            </div>
            <button
              onClick={() => handleCopy(result.postInsights, setCopiedInsights)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-tr from-yellow-500 to-orange-500 text-white rounded-full hover:scale-105 transition-transform text-sm"
            >
              <Copy size={14} />
              {copiedInsights ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-gray-700 rounded-md p-4">
            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
              {result.postInsights}
            </p>
          </div>
        </div>
      )}

      {/* Post Suggestions */}
      {result.postSuggestions && (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4 border-b border-gray-600 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Post Improvements
              </h3>
            </div>
            <button
              onClick={() => handleCopy(result.postSuggestions, setCopiedSuggestions)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-tr from-green-500 to-teal-500 text-white rounded-full hover:scale-105 transition-transform text-sm"
            >
              <Copy size={14} />
              {copiedSuggestions ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4 bg-gray-900 rounded-md overflow-x-auto">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p
                    className="text-sm text-white whitespace-pre-wrap break-words mb-3"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li
                    className="text-sm text-white ml-4 list-disc mb-2"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="mb-3" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-purple-300" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-semibold text-white mt-4 mb-2" {...props} />
                ),
              }}
            >
              {result.postSuggestions}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 metrics-card">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-600 pb-3">
          <BarChart3 size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Engagement Metrics
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors">
            <div className="text-2xl font-bold text-purple-400">
              {result?.analysis?.metrics?.hashtagCount ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Hashtags</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors">
            <div className="text-2xl font-bold text-blue-400">
              {result?.analysis?.metrics?.lengthCount ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Characters</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-pink-500 transition-colors">
            <div className="text-2xl font-bold text-pink-400">
              {result?.analysis?.metrics?.mentionCount ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Mentions (@)</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-green-500 transition-colors">
            <div className="text-2xl font-bold text-green-400">
              {result?.analysis?.metrics?.linkCount ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Links</div>
          </div>
        </div>
        
        {/* Sentiment Score Bar */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Sentiment Score</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white">
                {(result?.analysis?.metrics?.sentimentScore ?? 0).toFixed(1)}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                (result?.analysis?.metrics?.sentimentScore ?? 0) > 2 
                  ? 'bg-green-500/20 text-green-400'
                  : (result?.analysis?.metrics?.sentimentScore ?? 0) > -2
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {(result?.analysis?.metrics?.sentimentScore ?? 0) > 2 
                  ? 'Positive'
                  : (result?.analysis?.metrics?.sentimentScore ?? 0) > -2
                  ? 'Neutral'
                  : 'Negative'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-400">-5</span>
            <div className="flex-1 h-3 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      ((result?.analysis?.metrics?.sentimentScore ?? 0) + 5) * 10
                    )
                  )}%`,
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">+5</span>
          </div>
          
          {/* Sentiment Interpretation */}
          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              {(result?.analysis?.metrics?.sentimentScore ?? 0) > 3 
                ? '✨ Very positive tone! This content is likely to receive excellent engagement.'
                : (result?.analysis?.metrics?.sentimentScore ?? 0) > 1
                ? '👍 Positive tone. Good for building connections with your audience.'
                : (result?.analysis?.metrics?.sentimentScore ?? 0) > -1
                ? '😐 Neutral tone. Consider adding more emotional appeal for better engagement.'
                : (result?.analysis?.metrics?.sentimentScore ?? 0) > -3
                ? '⚠️ Somewhat negative tone. May reduce engagement unless addressing criticism.'
                : '❌ Very negative tone. Be cautious as this may hurt engagement.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;