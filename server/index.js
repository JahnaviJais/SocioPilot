// server.js - Complete Backend with Your Working Gemini Implementation + Auth

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { GoogleGenAI } = require('@google/genai');
const Sentiment = require('sentiment');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini AI (Your working version)
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Initialize Sentiment
const sentiment = new Sentiment();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Multer Configuration for File Upload
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
    cb(null, Date.now() + ext);
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

// Check if uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ===================== SCHEMAS =====================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Insight Schema
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

// Authentication Middleware
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

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
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

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
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

// Analyze Content Route (Your working implementation with auth)
app.post('/api/analyze', authMiddleware, upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    let text = '';

    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    }
    // Extract text from images
    else if (req.file.mimetype.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: (m) => console.log(m),
      });
      text = result.data.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    // Calculate sentiment score
    const sentimentResult = sentiment.analyze(text);
    
    // Compute engagement metrics
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

      // Your working prompts
      const [insightRes, suggestionsRes] = await Promise.all([
        gemini.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `
          You are a social media expert. Analyze the following post.
          First, provide your analysis in about 150 words, focusing on the strengths of the post.

          Important:
          - Keep it concise and actionable.
          - Do not include bullet points or numbered lists.
          - Focus only on the analysis.

          Post:
          ${input}
          `,
        }),
        gemini.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `
          You are a social media expert. Analyze the following post and provide 3-5 specific improvements to increase engagement.

          Focus on clarity, hashtags, call-to-action, tone, formatting, etc.

          Important:
          - Give improvements ONLY as a clean numbered list (1., 2., 3., etc).
          - Do not write any introductory text like "Here are improvements".
          - Each improvement should have a short heading in bold (**...**) followed by a clear explanation.

          Post:
          ${input}
          `,
        }),
      ]);

      aiInsight = insightRes.text?.trim() || 'No insight generated.';
      aiSuggestions = suggestionsRes.text?.trim() || 'No suggestions generated.';
    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      aiInsight = 'Could not generate insight at this time.';
      aiSuggestions = 'Could not generate suggestions at this time.';
    }

    // Save to database
    const insight = new Insight({
      userId: req.userId,
      fileName: req.file.originalname,
      extractedText: text,
      postInsights: aiInsight,
      postSuggestions: aiSuggestions,
      analysis: { metrics }
    });
    
    await insight.save();

    // Send response
    res.json({
      extractedText: text,
      postInsights: aiInsight,
      postSuggestions: aiSuggestions,
      analysis: { metrics },
      insightId: insight._id
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error('Analysis Error:', error);
    
    // Clean up file if exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to process the file' 
    });
  }
});

// Get User's Insights
app.get('/api/insights', authMiddleware, async (req, res) => {
  try {
    const insights = await Insight.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-extractedText'); // Exclude large text for list view
    
    res.json(insights);
  } catch (error) {
    console.error('Fetch Insights Error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Get Single Insight
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

// Delete Insight
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

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});