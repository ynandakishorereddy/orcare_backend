const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const clinicalKnowledge = `
You are ORCare AI, a dedicated professional dental assistant.
You ONLY discuss dental, oral health, and hygiene topics.
Provide accurate, helpful, and safe oral health guidance.
KEEP RESPONSES CONCISE: Limit your explanations to 3-4 lines normally.
`;

const getModel = () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: clinicalKnowledge,
    });
};

async function testControllerLogic() {
    console.log("🚀 Testing Chat Controller Logic...");
    const message = "My tooth hurts when I drink cold water. What could it be?";
    const history = []; // Empty for initial test

    try {
        const model = getModel();
        console.log("📡 Starting chat with Gemini...");
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log("\n✅ AI Response Received:");
        console.log("------------------------");
        console.log(responseText);
        console.log("------------------------");
        console.log("\n✨ Logic verification SUCCESSFUL!");
    } catch (error) {
        console.error("❌ ERROR during logic test:", error.message);
        process.exit(1);
    }
}

testControllerLogic();
