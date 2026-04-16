const { supabase } = require('../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const clinicalKnowledge = `
You are ORCare AI, a dedicated professional dental assistant.
You ONLY discuss dental, oral health, and hygiene topics.
Provide accurate, helpful, and safe oral health guidance.
KEEP RESPONSES CONCISE: Limit your explanations to 3-4 lines normally.
`;

const getModel = () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({
        model: "gemini-flash-latest", // Upgraded to flash-latest for robust generic fallback
        systemInstruction: clinicalKnowledge,
    });
};

// @desc Send chat message
const sendMessage = async (req, res) => {
    const userId = req.user?.id;
    const { sessionId, message } = req.body;

    if (!userId || !sessionId || !message) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // 1. Get or create chat session
        let { data: chatSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .single();

        if (sessionError || !chatSession) {
            const { data: newSession, error: createError } = await supabase
                .from('chat_sessions')
                .insert([{ user_id: userId, session_id: sessionId, title: 'New Chat' }])
                .select()
                .single();

            if (createError) throw createError;
            chatSession = newSession;
        }

        // 2. Save the incoming USER message proactively
        console.log(`[AI Chat] Saving user message: "${message}"`);
        const { data: savedUserMsg, error: userMsgError } = await supabase
            .from('chat_messages')
            .insert([{
                chat_session_id: chatSession.id,
                text: message,
                is_from_user: true
            }])
            .select()
            .single();

        if (userMsgError) console.error('[AI Chat] Warning: User message not saved:', userMsgError.message);

        // 3. Get history for Gemini (excluding the message we just saved)
        const { data: rawHistory, error: historyError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_session_id', chatSession.id)
            .lt('timestamp', savedUserMsg?.timestamp || new Date().toISOString()) // Only previous messages
            .order('timestamp', { ascending: true });

        if (historyError) throw historyError;

        // 4. Sanitize history for Gemini (strictly alternating roles, starting with user)
        const sanitizedHistory = [];
        let nextRole = 'user';

        for (const msg of (rawHistory || [])) {
            const role = msg.is_from_user ? 'user' : 'model';
            if (role === nextRole) {
                sanitizedHistory.push({
                    role: role,
                    parts: [{ text: msg.text }]
                });
                nextRole = (role === 'user') ? 'model' : 'user';
            }
        }

        // If history ends with 'user', Gemini will fail on startChat followed by sendMessage.
        // It must end with 'model'.
        if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
            sanitizedHistory.pop();
        }

        console.log(`[AI Chat] Sanitized history turns: ${sanitizedHistory.length}`);

        // 5. Initialize Gemini and Generate Response
        const model = getModel();
        const chat = model.startChat({ history: sanitizedHistory });
        
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log(`[AI Chat] Success! Response length: ${responseText.length}`);

        // 6. Save AI response
        const { error: aiMsgError } = await supabase
            .from('chat_messages')
            .insert([{
                chat_session_id: chatSession.id,
                text: responseText,
                is_from_user: false
            }]);

        if (aiMsgError) console.error('[AI Chat] Error saving AI response:', aiMsgError.message);

        return res.status(200).json({
            success: true,
            text: responseText
        });

    } catch (error) {
        console.error(`[AI Chat] ERROR:`, error.message);
        // Clean up error message for frontend if it's too technical
        let userMessage = "Failed to generate response";
        if (error.message.includes('safety')) userMessage = "Response blocked by safety filters.";
        if (error.message.includes('quota')) userMessage = "Daily limit reached. Please try again later.";
        
        return res.status(500).json({ 
            message: userMessage,
            details: error.message 
        });
    }
};

// @desc Get chat history
const getChatHistory = async (req, res) => {
    const userId = req.user?.id;
    const { sessionId } = req.query;

    if (!userId || !sessionId) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Get chat session
        const { data: chatSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .single();

        if (sessionError || !chatSession) {
            return res.status(404).json({ message: "Chat session not found" });
        }

        // Get messages
        const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_session_id', chatSession.id)
            .order('timestamp', { ascending: true });

        if (messagesError) throw messagesError;

        return res.status(200).json({
            success: true,
            messages: messages.map(msg => ({
                text: msg.text,
                isFromUser: msg.is_from_user,
                timestamp: msg.timestamp
            }))
        });
    } catch (error) {
        console.error('Get chat history error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch chat history" });
    }
};

// @desc Get all chat sessions
const getChatSessions = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            sessions: sessions.map(s => ({
                id: s.id,
                sessionId: s.session_id,
                title: s.title,
                createdAt: s.created_at
            }))
        });
    } catch (error) {
        console.error('Get chat sessions error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to fetch chat sessions" });
    }
};

// @desc Delete chat session
const deleteChatSession = async (req, res) => {
    const userId = req.user?.id;
    const { sessionId } = req.body;

    if (!userId || !sessionId) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Get chat session
        const { data: chatSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .single();

        if (sessionError || !chatSession) {
            return res.status(404).json({ message: "Chat session not found" });
        }

        // Delete messages first (cascade)
        const { error: messagesError } = await supabase
            .from('chat_messages')
            .delete()
            .eq('chat_session_id', chatSession.id);

        if (messagesError) throw messagesError;

        // Delete session
        const { error: deleteError } = await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', chatSession.id);

        if (deleteError) throw deleteError;

        return res.status(200).json({
            success: true,
            message: "Chat session deleted successfully"
        });
    } catch (error) {
        console.error('Delete chat session error:', error.message);
        return res.status(500).json({ message: error.message || "Failed to delete chat session" });
    }
};

module.exports = {
    sendMessage,
    getChatHistory,
    getChatSessions,
    deleteChatSession
};
