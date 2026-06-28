const dotenv = require('dotenv');
dotenv.config();
const { supabase } = require('./config/supabase');

async function checkDatabaseSchema() {
    console.log("🔍 Checking Database Schema for Chat...");
    
    try {
        // Check chat_sessions
        console.log("\n--- Table: chat_sessions ---");
        const { data: sessions, error: sesError } = await supabase
            .from('chat_sessions')
            .select('*')
            .limit(1);
        
        if (sesError) console.error("❌ chat_sessions error:", sesError.message);
        else console.log("✅ chat_sessions exists.", sessions);

        // Check chat_messages
        console.log("\n--- Table: chat_messages ---");
        const { data: messages, error: msgError } = await supabase
            .from('chat_messages')
            .select('*')
            .limit(1);
            
        if (msgError) console.error("❌ chat_messages error:", msgError.message);
        else console.log("✅ chat_messages exists.", messages);

    } catch (error) {
        console.error("❌ General Error:", error.message);
    }
}

checkDatabaseSchema();
