require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('No GEMINI_API_KEY found in .env');
        return;
    }
    console.log(`Using Key: ${key.substring(0, 5)}...`);
    
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        console.log('Generating content...');
        const result = await model.generateContent('Say hello world');
        console.log('Response:', result.response.text());
        console.log('✅ Gemini API is working!');
    } catch (e) {
        console.error('❌ Gemini Error:', e.message);
    }
}

testGemini();
