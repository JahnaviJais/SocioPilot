// server.js - Production Ready Version

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { GoogleGenAI } = require('@google/genai');
const Sentiment = require('sentiment');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Trust proxy for production platforms
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS Configuration - Production ready
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini AI
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Initialize Sentiment
const sentiment = new Sentiment();

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).substring(7) + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPG are allowed.'));
    }
  }
});

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ===================== SCHEMAS =====================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const insightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String, required: true },
  postInsights: String,
  postSuggestions: String,
  analysis: {
    metrics: {
      hashtagCount: Number,
      lengthCount: Number,
      mentionCount: Number,
      linkCount: Number,
      sentimentScore: Number
    }
  },
  createdAt: { type: Date, default: Date.now }
});

const Insight = mongoose.model('Insight', insightSchema);

// ===================== MIDDLEWARE =====================

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ===================== AUTH ROUTES =====================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ===================== ANALYSIS ROUTES =====================

app.post('/api/analyze', authMiddleware, upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (req.file.mimetype.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng');
      text = result.data.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    const sentimentResult = sentiment.analyze(text);
    
    const metrics = {
      hashtagCount: (text.match(/#/g) || []).length,
      lengthCount: text.length,
      mentionCount: (text.match(/@/g) || []).length,
      linkCount: (text.match(/https?:\/\/\S+/g) || []).length,
      sentimentScore: sentimentResult.score,
    };

    let aiInsight = '';
    let aiSuggestions = '';

    try {
      const input = text.slice(0, 2000);
      
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        throw new Error('Gemini API key not configured');
      }
      
      const insightPrompt = `You are a social media expert. Analyze the following post in about 150 words, focusing on strengths. Keep it concise and actionable without bullet points.\n\nPost: ${input}`;

      const suggestionsPrompt = `You are a social media expert. Provide 3-5 specific improvements as a numbered list only. Each with bold heading and explanation.\n\nPost: ${input}`;

      const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-pro'];
      let insightRes, suggestionsRes;
      
      for (const model of models) {
        try {
          [insightRes, suggestionsRes] = await Promise.all([
            gemini.models.generateContent({ model, contents: insightPrompt }),
            gemini.models.generateContent({ model, contents: suggestionsPrompt }),
          ]);
          break;
        } catch (modelError) {
          if (model === models[models.length - 1]) throw modelError;
        }
      }

      aiInsight = insightRes.text?.trim() || 'No insight generated.';
      aiSuggestions = suggestionsRes.text?.trim() || 'No suggestions generated.';

    } catch (aiError) {
      console.error('Gemini AI error:', aiError.message);
      
      aiInsight = `This post contains ${text.length} characters with ${metrics.hashtagCount} hashtags and ${metrics.mentionCount} mentions. Sentiment score: ${metrics.sentimentScore}. The AI analysis service is temporarily unavailable.`;
      
      aiSuggestions = `1. **Optimize hashtags**: ${metrics.hashtagCount === 0 ? 'Add relevant hashtags to increase discoverability.' : 'Review hashtags for better reach.'}\n\n2. **Engagement**: ${metrics.mentionCount === 0 ? 'Consider tagging relevant accounts.' : 'Good use of mentions!'}\n\n3. **Call-to-action**: Add a clear call-to-action.\n\n4. **Content length**: ${text.length < 100 ? 'Consider expanding content.' : 'Good length!'}\n\n5. **Tone**: ${metrics.sentimentScore > 0 ? 'Positive tone - great!' : metrics.sentimentScore < 0 ? 'Consider more positive language.' : 'Add emotion for better connection.'}`;
    }

    const insight = new Insight({
      userId: req.userId,
      fileName: req.file.originalname,
      extractedText: text,
      postInsights: aiInsight,
      postSuggestions: aiSuggestions,
      analysis: { metrics }
    });
    
    await insight.save();

    res.json({
      extractedText: text,
      postInsights: aiInsight,
      postSuggestions: aiSuggestions,
      analysis: { metrics },
      insightId: insight._id
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
  } catch (error) {
    console.error('Analysis Error:', error);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to process the file' 
    });
  }
});

app.get('/api/insights', authMiddleware, async (req, res) => {
  try {
    const insights = await Insight.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-extractedText');
    
    res.json(insights);
  } catch (error) {
    console.error('Fetch Insights Error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

app.get('/api/insights/:id', authMiddleware, async (req, res) => {
  try {
    const insight = await Insight.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    
    res.json(insight);
  } catch (error) {
    console.error('Fetch Insight Error:', error);
    res.status(500).json({ error: 'Failed to fetch insight' });
  }
});

app.delete('/api/insights/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Insight.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    
    res.json({ message: 'Insight deleted successfully' });
  } catch (error) {
    console.error('Delete Insight Error:', error);
    res.status(500).json({ error: 'Failed to delete insight' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});