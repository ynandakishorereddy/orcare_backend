const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load clinical knowledge base
const kbPath = path.join(__dirname, '../../knowledge_base.md');
let clinicalKnowledge = "";
try {
    clinicalKnowledge = fs.readFileSync(kbPath, 'utf8');
} catch (error) {
    console.warn("Clinical Knowledge Base not found. Proceeding with limited context.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are ORCare AI, a dedicated professional dental assistant. Your primary goal is to provide accurate, helpful, and safe oral health guidance.

STRICT LIMITATION: YOU MUST ONLY DISCUSS DENTAL, ORAL HEALTH, AND HYGIENE. 

CLINICAL KNOWLEDGE BASE OVERVIEW:
${clinicalKnowledge}

CORE OPERATING GUIDELINES:
1. STRICT ADHERENCE: Only provide information related to oral health, dental symptoms, hygiene, and preventive care. 
2. REJECT NON-DENTAL QUERIES: If a user asks about general health (like a fever, leg pain, etc.) or any topic unrelated to dentistry (lifestyle, weather, general knowledge), politely but firmly state: "I am ORCare AI, specialized only in oral and dental health. I cannot provide information on other topics. Do you have a question about your dental health?"
3. CLINICAL ACCURACY: Cross-reference user symptoms with the "Oral Diseases & Conditions" and "Daily Tips" in the knowledge base.
4. SAFETY FIRST: For severe symptoms (intense pain, swelling, loose teeth, or issues lasting >2 days), ALWAYS advise visiting a dentist immediately.
5. CONCISION: Provide extremely brief answers (2-3 lines max) for normal questions. Only provide more detail if the user explicitly asks for "more" or deeper explanation.
6. NO MARKDOWN: DO NOT use asterisks (*), hashtags (#), or any other markdown formatting symbols in your messages. Use plain text only.
7. PROFESSIONAL TONE: Be warm, empathetic, and extremely concise.`
});

const Chat = require('../models/Chat');

const chatController = {
    // @desc    Get AI Response
    // @route   POST /api/chat/chat
    // @access  Public (or Private if token provided)
    getChatResponse: async (req, res) => {
        try {
            const { message, history } = req.body;
            console.log(`\n[AI Chat] Incoming message: "${message}"`);
            console.log(`[AI Chat] History length: ${history ? history.length : 0} turns`);

            if (!message) {
                return res.status(400).json({ message: "Message is required" });
            }

            // Sanitize history to ensure correct format for Gemini SDK
            const sanitizedHistory = (history || []).map(turn => ({
                role: turn.role === 'assistant' ? 'model' : turn.role,
                parts: Array.isArray(turn.parts) ? turn.parts : [{ text: turn.content || turn.text }]
            }));

            const chat = model.startChat({
                history: sanitizedHistory,
            });

            // Set a timeout for the AI response
            const responsePromise = chat.sendMessage(message);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Gemini API timeout after 25s")), 25000)
            );

            const result = await Promise.race([responsePromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();
            
            console.log(`[AI Chat] Success! Generated ${text.length} chars.`);

            res.json({ text });
        } catch (error) {
            console.error("\n❌ [AI Chat] ERROR:");
            console.error(`Message: ${error.message}`);
            if (error.status) console.error(`Status: ${error.status}`);
            
            let userMessage = "Error communicating with ORCare AI";
            if (error.message.includes("timeout")) userMessage = "AI response timed out. Please try again.";
            
            res.status(500).json({ message: userMessage });
        }
    },

    // @desc    Save chat messages to database
    // @route   POST /api/chat/save
    // @access  Private
    saveChatHistory: async (req, res) => {
        try {
            const { sessionId, title, messages } = req.body;
            const userId = req.user._id;

            let chat = await Chat.findOne({ userId, sessionId });

            if (chat) {
                // If appending messages
                if (messages && messages.length > 0) {
                    chat.messages.push(...messages);
                }
                if (title) chat.title = title;
                await chat.save();
            } else {
                // Create new session
                chat = new Chat({
                    userId,
                    sessionId,
                    title: title || 'New Chat',
                    messages: messages || []
                });
                await chat.save();
            }

            res.status(201).json({ success: true, chat });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // @desc    Get user chat history
    // @route   GET /api/chat/history
    // @access  Private
    getUserChats: async (req, res) => {
        try {
            const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
            res.json(chats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = chatController;
