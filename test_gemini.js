const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`\n🚀 Testing Gemini API Connection...`);
    console.log(`-----------------------------------`);
    
    if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY is not set in .env file!');
        process.exit(1);
    }
    
    try {
        console.log(`📋 Fetching authorized models from Google API...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        
        const response = await axios.get(url);
        const models = response.data.models;
        
        if (models && models.length > 0) {
            console.log(`✅ Success! Found ${models.length} authorized models.`);
            const generativeModels = models.filter(m => m.supportedGenerationMethods.includes('generateContent'))
                                            .map(m => m.name.replace('models/', ''));
            
            // Priority list of stable models to try
            const targetModels = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-1.5-pro", "gemini-pro-latest", "gemini-1.5-flash-8b"];
            
            for (const modelName of targetModels) {
                if (generativeModels.includes(modelName)) {
                    try {
                        console.log(`📡 Testing: ${modelName}...`);
                        const genAI = new GoogleGenerativeAI(apiKey);
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent("Hello!");
                        const aiRes = await result.response;
                        console.log(`✅ Assistant (${modelName}): "${aiRes.text()}"`);
                        console.log(`✨ SUCCESS with ${modelName}!\n`);
                        return; // Exit on first success
                    } catch (e) {
                        console.warn(`⚠️ Error with ${modelName}: ${e.message}`);
                    }
                } else {
                    console.log(`⏭️ Skipping ${modelName} (not in authorized list)`);
                }
            }
        }
 else {
            console.error(`❌ No models found. This API key might not have the Generative Language API enabled.`);
        }
        
    } catch (error) {
        console.error(`\n❌ Error fetching models:`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(`Message: ${error.message}`);
        }
        process.exit(1);
    }
}

testGemini();
