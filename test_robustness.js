const dotenv = require('dotenv');
dotenv.config();
const { sendMessage } = require('./controllers/chatController_supabase');
const { supabase } = require('./config/supabase');

async function testRobustness() {
    const userId = '08b6e9dd-1396-433d-9574-5c0d3050bab8';
    const sessionId = 'robust-session-' + Date.now();

    console.log("🧪 Testing Robust Gemini Integration...");

    // Mock express res
    const res = {
        status: (code) => ({
            json: (data) => console.log(`[Status ${code}]`, JSON.stringify(data, null, 2))
        })
    };

    // 1. Create session
    const { data: session } = await supabase
        .from('chat_sessions')
        .insert([{ user_id: userId, session_id: sessionId, title: 'Robust Test' }])
        .select().single();

    // 2. Inject "Bad" history (two consecutive user messages)
    console.log("🛠️ Injecting unbalanced history (User, User)...");
    await supabase.from('chat_messages').insert([
        { chat_session_id: session.id, text: 'Hello AI', is_from_user: true },
        { chat_session_id: session.id, text: 'Are you there?', is_from_user: true } 
    ]);

    // 3. Call sendMessage
    console.log("🚀 Calling sendMessage (should resolve history balance automatically)...");
    await sendMessage({
        user: { id: userId },
        body: { sessionId, message: 'I have tooth pain' }
    }, res);
}

testRobustness().catch(console.error);
