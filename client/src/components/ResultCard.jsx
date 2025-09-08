import { FileText, Sparkles, Copy, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ResultCard = ({ result, onCopyContent, copiedContent }) => {
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
            onClick={onCopyContent}
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
          <div className="flex items-center gap-2 mb-4 border-b border-gray-600 pb-3">
            <Sparkles size={20} />
            <h3 className="text-lg font-semibold text-white">Post Insights</h3>
          </div>
          <div className="bg-gray-700 rounded-md p-4">
            <p className="text-sm text-white whitespace-pre-wrap ">
              {result.postInsights}
            </p>
          </div>
        </div>
      )}

      {/* Post Suggestions */}
      {result.postSuggestions && (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-600 pb-3">
            <Sparkles size={20} />
            <h3 className="text-lg font-semibold text-white">
              Post Improvements
            </h3>
          </div>
          <div className="p-4 bg-gray-900 rounded-md overflow-x-auto">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p
                    className="text-sm text-white whitespace-pre-wrap break-words"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li
                    className="text-m text-white ml-4 list-disc"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
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
          <BarChart3 size={20} className="text-white" />
          <h3 className="text-lg font-semibold text-white">
            Engagement Metrics
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="text-xl font-bold text-white">
              {result?.analysis?.metrics?.hashtagCount ?? 0}
            </div>
            <div className="text-xs text-gray-400">Hashtags</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="text-xl font-bold text-white">
              {result?.analysis?.metrics?.lengthCount ?? 0}
            </div>
            <div className="text-xs text-gray-400">Length</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="text-xl font-bold text-white">
              {result?.analysis?.metrics?.mentionCount ?? 0}
            </div>
            <div className="text-xs text-gray-400">Mentions (@)</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="text-xl font-bold text-white">
              {result?.analysis?.metrics?.linkCount ?? 0}
            </div>
            <div className="text-xs text-gray-400">Links</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Sentiment Score</span>
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-tr from-blue-500 to-green-500"
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
          <span className="text-sm font-semibold text-white">
            {((result?.analysis?.metrics?.sentimentScore ?? 0)+5).toFixed(1) }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
