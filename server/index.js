const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai"); //to call api for content analysis
const Sentiment = require('sentiment');

require("dotenv").config();

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sentiment = new Sentiment();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Used multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// check if uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Post Route
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    let text = "";

    // Extracting text from PDF
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    }
    // Extracting text from images
    else if (req.file.mimetype.startsWith("image/")) {
      const result = await Tesseract.recognize(filePath, "eng", {
        logger: (m) => console.log(m),
      });
      text = result.data.text;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

     // to calculate sentiment score
    const sentimentResult = sentiment.analyze(text);
    
    // compute engagement metrics
    const metrics = {
      hashtagCount: (text.match(/#/g) || []).length,
      lengthCount: text.length,
      mentionCount: (text.match(/@/g) || []).length,
      linkCount: (text.match(/https?:\/\/\S+/g) || []).length,
      sentimentScore: sentimentResult.score,
    };
   
    

    let aiInsight = "";
    let aiSuggestions = "";

    try {
      const input = text.slice(0, 2000); 

      const [insightRes, suggestionsRes] = await Promise.all([
        gemini.models.generateContent({
          model: "gemini-2.5-flash",
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
          model: "gemini-2.5-flash",
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

      aiInsight = insightRes.text?.trim() || "No insight generated.";
      aiSuggestions = suggestionsRes.text?.trim() || "No suggestions generated.";
    } catch (aiError) {
      console.error("Gemini AI error:", aiError);
      aiInsight = "Could not generate insight at this time.";
      aiSuggestions = "Could not generate suggestions at this time.";
    }

    // Sending response
    res.json({
      extractedText: text,
      postInsights: aiInsight,
      postSuggestions: aiSuggestions,
      analysis: { metrics },
    });

    // Cleaning uploaded file
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process the file" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
