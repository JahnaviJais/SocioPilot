import { useState } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import ErrorMessage from "./components/ErrorMessage";
import Loading from "./components/Loading";
import ResultCard from "./components/ResultCard";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [analysisLevel, setAnalysisLevel] = useState(null);
  const [copiedContent, setCopiedContent] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!allowedTypes.includes(f.type)) {
      setError("File type not supported. Please upload PDF, JPG, or PNG.");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF, JPG, or PNG file.");
      return;
    }
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data } = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setAnalysisLevel("medium");
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const copyWithFeedback = (text, setFlag, ms = 1500) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setFlag(true);
    setTimeout(() => setFlag(false), ms);
  };

  const handleCopyContent = () =>
    copyWithFeedback(result?.extractedText, setCopiedContent, 1200);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors">
      {/* Background set */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(244,114,182,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(167,139,250,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_25%,rgba(96,165,250,0.1)_0%,transparent_50%),radial-gradient(circle_at_25%_75%,rgba(52,211,153,0.1)_0%,transparent_50%)] bg-[length:800px_800px] animate-float pointer-events-none"></div>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-800/80 border-b border-gray-600">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-tr from-pink-500 to-purple-500 bg-clip-text text-transparent">
            SocioPilot
          </h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto p-4 space-y-8">
        
        <section className="text-center">
          <h1 className="text-4xl font-semibold bg-gradient-to-tr from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Social Media Content Analyzer
          </h1>
          <p className="text-gray-300 mt-2">
            Upload a PDF or image of a post — I’ll extract the content, analyze
            it, and suggest improvements to boost engagement.
          </p>
        </section>

        {/* Upload file */}
        <section className="bg-gray-800 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700 space-y-4">
          <h2 className="text-center text-xl font-semibold text-gray-100 mb-2">
            Upload Document
          </h2>
          <FileUpload
            file={file}
            onFileChange={handleFileChange}
            dragActive={dragActive}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            loading={loading}
          />

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold transition transform ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-tr from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white hover:scale-105"
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                "Analyze"
              )}
            </button>

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setAnalysisLevel("medium");
                setError("");
                setCopiedContent(false);
                setCopiedInsights(false);
                setCopiedSuggestions(false);
              }}
              className="px-6 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
            >
              Start Over
            </button>
          </div>
        </section>

        {loading && <Loading />}

        <ErrorMessage error={error} />

        {/* Display analysis */}
        {result && (
          <ResultCard
            result={result}
            analysisLevel={analysisLevel}
            setAnalysisLevel={setAnalysisLevel}
            onCopyContent={handleCopyContent}
            copiedContent={copiedContent}
          />
        )}
      </main>
      
      <footer className="w-full bg-gray-900 text-center py-4 mt-8 rounded-t-xl shadow-inner">
        <p className="text-sm text-gray-400">
          Made with ❤️ by{" "}
          <span className="font-semibold text-white">Jahnavi Jaiswal</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
