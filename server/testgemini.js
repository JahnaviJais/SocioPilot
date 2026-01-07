// test-gemini.js - Save this in your server folder and run: node test-gemini.js

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n');
  
  // Check API key
  console.log('1. Checking API Key...');
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    console.log('\n💡 Fix: Add this to server/.env:');
    console.log('GEMINI_API_KEY=your_api_key_here');
    return;
  }
  console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  // Initialize Gemini
  console.log('\n2. Initializing Gemini...');
  try {
    const gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    console.log('✅ Gemini initialized');
    
    // Test simple generation
    console.log('\n3. Testing simple generation...');
    const simpleResult = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello!'
    });
    console.log('✅ Response:', simpleResult.text);
    
    // Test your actual prompt
    console.log('\n4. Testing your insight prompt...');
    const insightResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `
        You are a social media expert. Analyze the following post.
        First, provide your analysis in about 150 words, focusing on the strengths of the post.

        Important:
        - Keep it concise and actionable.
        - Do not include bullet points or numbered lists.
        - Focus only on the analysis.

        Post:
        Check out our new product launch! #innovation #tech
        `
    });
    console.log('✅ Insight generated:');
    console.log(insightResult.text);
    
    // Test suggestions prompt
    console.log('\n5. Testing your suggestions prompt...');
    const suggestionsResult = await gemini.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `
        You are a social media expert. Analyze the following post and provide 3-5 specific improvements to increase engagement.

        Focus on clarity, hashtags, call-to-action, tone, formatting, etc.

        Important:
        - Give improvements ONLY as a clean numbered list (1., 2., 3., etc).
        - Do not write any introductory text like "Here are improvements".
        - Each improvement should have a short heading in bold (**...**) followed by a clear explanation.

        Post:
        Check out our new product launch! #innovation #tech
        `
    });
    console.log('✅ Suggestions generated:');
    console.log(suggestionsResult.text);
    
    console.log('\n🎉 All tests passed! Your Gemini API is working perfectly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Fix: Your API key is invalid. Get a new one from:');
      console.log('https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Fix: Rate limit exceeded. Wait 1 minute and try again.');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Fix: Model not found. Check if gemini-2.0-flash-exp is available.');
      console.log('Try using: gemini-pro or gemini-1.5-flash instead');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Fix: Network error. Check your internet connection.');
    } else {
      console.log('\n💡 Full error details:');
      console.log(error);
    }
  }
}

testGemini();

/* 
EXPECTED OUTPUT IF WORKING:
===========================
🧪 Testing Gemini API...

1. Checking API Key...
✅ API Key found: AIzaSyBc1...

2. Initializing Gemini...
✅ Gemini initialized

3. Testing simple generation...
✅ Response: Hello! How can I help you today?

4. Testing your insight prompt...
✅ Insight generated:
[Your insight analysis here...]

5. Testing your suggestions prompt...
✅ Suggestions generated:
1. **Heading**: explanation...

🎉 All tests passed! Your Gemini API is working perfectly.


COMMON ERRORS:
=============
❌ GEMINI_API_KEY not found in .env file
   → Add GEMINI_API_KEY=your_key to server/.env

❌ Error: API key not valid
   → Get new key from https://aistudio.google.com/app/apikey

❌ Error: 429
   → Rate limit hit, wait 1 minute

❌ Error: 404
   → Model not found, try different model name
*/