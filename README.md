# 📱 SocioPilot – Social Media Content Analyzer

A modern, responsive web application that helps you analyze social media posts by extracting content from PDF or image files and providing insights and suggestions to boost engagement. Designed with **React**, **Tailwind CSS**, and a **Node.js/Express** backend.

---

# 🚀 Features


✅ Smart Uploads – Upload PDF, JPG, or PNG files with drag & drop or file selection
✅ AI-Powered Analysis – Extracts text from files and generates actionable insights
✅ Text Preview – View extracted content and copy it easily
✅ Improvement Suggestions – Provides recommendations to enhance post reach and readability
✅ Engagement Metrics – Analyze hashtags, post length, mentions, and links
✅ Sentiment Analysis – Visual sentiment score indicator for audience response
✅ Responsive Design – Works seamlessly on desktop, tablet, and mobile devices


---

##  🛠 Tech Stack

### Frontend:

- React (Vite) – Fast and modern UI framework

- Axios – API requests and file uploads

- Tailwind CSS – Utility-based styling with custom themes and animations

### Backend:

- Node.js + Express – Handles file uploads and API endpoints

### AI / Analysis:

- Gemini API (LLM-powered) – Extracts text and generates insights using Google’s Gemini large language model

### Deployment:

- Vercel / Render – Hosting and deployment platforms for frontend and backend

---


## 📂 Project Structure

SocioPilot/
├── client/ # React frontend with Tailwind CSS
│ ├── public/
│ ├── src/
│ │ ├── components/ # Reusable React components
│ │ ├── App.jsx # Main application
│ │ ├── main.jsx # Entry point
│ │ ├── index.css # Tailwind CSS imports
│ ├── .env # Frontend environment variables
│ ├── tailwind.config.js # Tailwind configuration
│ ├── postcss.config.js
│ └── package.json
├── server/ # Node.js backend with Express
│ ├── uploads/ # Temporary storage for files
│ ├── index.js # API routes and server setup
│ ├── .env # Backend environment variables
│ └── package.json
├── README.md # Project documentation

---

