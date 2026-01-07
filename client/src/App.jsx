import { useState, useEffect } from "react";
import { Upload, LogOut, User, TrendingUp, Zap, Shield, Menu, X } from "lucide-react";
import ResultCard from "./components/ResultCard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [analysisLevel, setAnalysisLevel] = useState("medium");
  const [savedInsights, setSavedInsights] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Ensure savedInsights is always an array
  const safeInsights = Array.isArray(savedInsights) ? savedInsights : [];

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("sociopilot_token");
    const user = localStorage.getItem("sociopilot_user");
    
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user));
        loadUserInsights();
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem("sociopilot_token");
        localStorage.removeItem("sociopilot_user");
        setCurrentUser(null);
        setSavedInsights([]);
      }
    } else {
      setSavedInsights([]);
    }
  }, []);

  const loadUserInsights = async () => {
    try {
      const API_URL = 'http://localhost:5000';
      const token = localStorage.getItem('sociopilot_token');
      
      if (!token) {
        setSavedInsights([]);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedInsights(Array.isArray(data) ? data : []);
      } else {
        setSavedInsights([]);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      setSavedInsights([]);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!isLogin && !authForm.name) {
      setError("Name is required for signup");
      return;
    }
    if (!authForm.email || !authForm.password) {
      setError("Email and password are required");
      return;
    }
    
    if (authForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const API_URL = 'http://localhost:5000';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      
      // Prepare payload - only send name for signup
      const payload = isLogin 
        ? { email: authForm.email, password: authForm.password }
        : { name: authForm.name, email: authForm.email, password: authForm.password };
      
      console.log('Sending auth request to:', `${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Auth response:', response.status, data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user
      localStorage.setItem("sociopilot_token", data.token);
      localStorage.setItem("sociopilot_user", JSON.stringify(data.user));
      
      setCurrentUser(data.user);
      setSavedInsights([]); // Reset insights
      setShowAuth(false);
      setAuthForm({ name: "", email: "", password: "" });
      
      // Load insights after setting user
      setTimeout(() => loadUserInsights(), 100);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sociopilot_token");
    localStorage.removeItem("sociopilot_user");
    setCurrentUser(null);
    setSavedInsights([]);
    setResult(null);
    setFile(null);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
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
    setLoading(true);

    try {
      const API_URL = 'http://localhost:5000';
      const token = localStorage.getItem('sociopilot_token');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }
      
      const data = await response.json();
      setResult(data);
      
      // Refresh insights list
      await loadUserInsights();
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
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

  // Landing Page (when not logged in)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SocioPilot
            </h1>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Transform Your Social Media
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Content Strategy
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Upload any post, get AI-powered insights, and discover actionable improvements to boost engagement and reach.
          </p>
          
          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
          >
            Start Analyzing Free
          </button>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all">
              <TrendingUp className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Smart Analysis</h3>
              <p className="text-gray-400">
                Get detailed insights on sentiment, engagement potential, and content tone
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-pink-500 transition-all">
              <Zap className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Instant Results</h3>
              <p className="text-gray-400">
                Upload PDFs or images and receive analysis in seconds
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all">
              <Shield className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Save & Track</h3>
              <p className="text-gray-400">
                Store all your analyses and track improvements over time
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center py-6 mt-12 border-t border-gray-800">
          <p className="text-gray-400">
            Made with ❤️ by <span className="text-white font-semibold">Jahnavi Jaiswal</span>
          </p>
        </footer>

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 relative">
              <button
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {isLogin ? "Welcome Back" : "Join SocioPilot"}
              </h2>
              
              <div className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white"
                      placeholder="Your name"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white"
                    placeholder="••••••••"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={handleAuth}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </button>
              </div>
              
              <p className="text-center mt-6 text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main App (when logged in)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(244,114,182,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(167,139,250,0.1)_0%,transparent_50%)] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-800/80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SocioPilot
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center space-x-3 bg-gray-700/50 px-4 py-2 rounded-full">
              <User className="w-5 h-5 text-purple-400" />
              <span className="font-medium">{currentUser.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar for saved insights */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Saved Insights</h2>
              <button onClick={() => setShowSidebar(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {safeInsights.length === 0 ? (
              <p className="text-gray-400">No saved insights yet</p>
            ) : (
              <div className="space-y-4">
                {safeInsights.map((insight) => (
                  <div key={insight._id || insight.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <p className="font-semibold text-sm">{insight.fileName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(insight.createdAt || insight.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Upload Section */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Upload Your Content
          </h2>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-200 mb-2 font-medium">
              {file ? file.name : "Drag and drop your file here"}
            </p>
            <p className="text-sm text-gray-400 mb-4">or</p>
            <label className="inline-block px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg cursor-pointer transition-all">
              Browse Files
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              onClick={onSubmit}
              disabled={loading || !file}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                loading || !file
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
              }`}
            >
              {loading ? "Analyzing..." : "Analyze Content"}
            </button>

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setError("");
              }}
              className="px-8 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
            >
              Clear
            </button>
          </div>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Analyzing your content...</p>
          </div>
        )}

        {result && (
          <ResultCard result={result} />
        )}
      </main>

      <footer className="relative z-10 text-center py-6 mt-12 border-t border-gray-800">
        <p className="text-gray-400">
          Made with ❤️ by <span className="text-white font-semibold">Jahnavi Jaiswal</span>
        </p>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;