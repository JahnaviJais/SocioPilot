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


---

##  🛠 Tech Stack

### Frontend:

- React (Vite) – Fast and modern UI framework

- Axios – API requests and file uploads

- Tailwind CSS – Utility-based styling with custom themes and animations

### Backend:

- Node.js + Express – Handles file uploads and API endpoints

- Multer – Handling file uploads

- pdf-parse – Extracting text from PDF files

- Tesseract.js – OCR (Optical Character Recognition) for reading text from images

- Cors – Enabling cross-origin requests

- dotenv – Managing environment variables

### AI / Analysis:

- Gemini API (LLM-powered) – Extracts text and generates insights using Google’s Gemini large language model

### Deployment:

- Vercel / Render – Hosting and deployment platforms for frontend and backend

---


## 📂 Project Structure

```
SocioPilot/
├── client/               # React frontend with Tailwind CSS
│ ├── public/
│ ├── src/
│ │ ├── components/       # Reusable React components
│ │ ├── App.jsx           # Main application
│ │ ├── main.jsx          # Entry point
│ │ ├── index.css         # Tailwind CSS imports
│ ├── .env                # Frontend environment variables
│ ├── tailwind.config.js  # Tailwind configuration
│ ├── postcss.config.js
│ └── package.json
├── server/               # Node.js backend with Express
│ ├── uploads/            # Temporary storage for files
│ ├── index.js            # API routes and server setup
│ ├── .env                # Backend environment variables
│ └── package.json
├── README.md             # Project documentation

```
---

## Installation & Setup

1. Clone this repository:
    ```bash
    git clone https://github.com/JahnaviJais/SocioPilot---Social-Media-Content-Analyzer.git
    cd SocioPilot---Social-Media-Content-Analyzer
    ```
2. Set Up the Backend
    ```bash
    cd server
    npm install
    ```
    Environment Variables: Create a .env file in the server directory with the following content:
   ```bash
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the Server:
   ```bash
   npm start
   ```
   The backend will run on http://localhost:5000.
   
3. Set Up the Frontend
    ```bash
    cd ../client
    npm install
    ```
    Start the Client:
    ```bash
    npm run dev
    ```
    The frontend will run on http://localhost:3000.

4. Access the Application
   
   Open your browser and navigate to http://localhost:3000 to use SocioPilot.

---

##  Conclusion
The **Social Media Content Analyzer** provides valuable insights into social media trends and engagement. Future improvements will enhance accuracy and usability, making it a more robust tool for digital marketers and content creators.

