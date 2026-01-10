# 📱 SocioPilot – AI-Powered Social Media Content Analyzer

A modern, full-stack web application that helps you analyze and optimize social media posts using AI. Upload content from PDF or image files, get intelligent insights, and receive actionable suggestions to boost engagement. Built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Features

### 🎯 Core Features
✅ **User Authentication** – Secure signup/login system with JWT tokens  
✅ **Smart File Uploads** – Upload PDF, JPG, or PNG files via drag & drop or file selection  
✅ **AI-Powered Analysis** – Powered by Google Gemini AI for intelligent content insights  
✅ **Text Extraction** – OCR for images (Tesseract.js) and PDF parsing  
✅ **Post Insights** – AI-generated analysis of your content's strengths and engagement potential  
✅ **Improvement Suggestions** – Actionable recommendations to enhance reach and readability  

### 📊 Analytics & Metrics
✅ **Engagement Metrics** – Track hashtags, mentions, links, and post length  
✅ **Sentiment Analysis** – Visual sentiment score with color-coded indicators  
✅ **Content Preview** – View extracted text with easy copy functionality   

### 🎨 Modern UI/UX
✅ **Responsive Design** – Works seamlessly on desktop, tablet, and mobile  
✅ **Dark Theme** – Eye-friendly gradient design with glassmorphism effects  

---

## 🛠 Tech Stack

### Frontend:
- **React (Vite)** – Fast and modern UI framework
- **Tailwind CSS** – Utility-first styling with custom animations
- **Lucide React** – Beautiful icon library
- **Axios** – HTTP client for API requests

### Backend:
- **Node.js + Express** – RESTful API server
- **MongoDB + Mongoose** – Database for users and insights
- **JWT** – Secure authentication
- **Bcrypt** – Password hashing
- **Multer** – File upload handling
- **pdf-parse** – PDF text extraction
- **Tesseract.js** – OCR for image text extraction
- **Sentiment** – Sentiment analysis library
- **CORS** – Cross-origin resource sharing
- **Helmet** – Security headers
- **Express Rate Limit** – API rate limiting

### Deployment:
- **Frontend**: Vercel 
- **Backend**: Render 
- **Database**: MongoDB Atlas

---

## 📂 Project Structure

```
SocioPilot/
├── client/                      # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ResultCard.jsx   # Analysis results display
│   │   ├── App.jsx              # Main application with auth
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Tailwind CSS imports
│   ├── .env                     # Frontend environment variables
│   ├── .env.production          # Production environment variables
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js
│   └── package.json
│
├── server/                      # Node.js backend
│   ├── uploads/                 # Temporary file storage
│   ├── index.js                 # Main server file with all routes
│   ├── .env                     # Backend environment variables
│   └── package.json
│
├── README.md                    # Project documentation
└── .gitignore
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Gemini API Key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/JahnaviJais/SocioPilot.git
cd SocioPilot
```

### 2. Backend Setup

```bash
cd server
npm install
```

**Create `.env` file in `server/` directory:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sociopilot
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/sociopilot

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Start the Backend Server:**
```bash
npm start
```
Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client
npm install
```

**Create `.env` file in `client/` directory:**
```env
VITE_API_URL=http://localhost:5000
```

**Start the Frontend:**
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 👩‍💻 Author

**Jahnavi Jaiswal**

- GitHub: [@JahnaviJais](https://github.com/JahnaviJais)
- Project: [SocioPilot](https://github.com/JahnaviJais/SocioPilot)

---