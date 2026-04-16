const dotenv = require('dotenv');
dotenv.config();
const { sendMessage } = require('./controllers/chatController_supabase');

// Mock express response/request
const req = {
    user: { id: '08b6e9dd-1396-433d-9574-5c0d3050bab8' }, // Real user ID from previous check
    body: {
        sessionId: 'session-test-' + Date.now(),
        message: 'hi'
    }
};

const res = {
    status: (code) => {
        console.log('Status Code:', code);
        return {
            json: (data) => console.log('JSON Response:', JSON.stringify(data, null, 2))
        };
    }
};

async function testSendMessage() {
    console.log("🧪 Testing sendMessage controller handler...");
    try {
        await sendMessage(req, res);
    } catch (e) {
        console.error("🔥 UNCAUGHT ERROR:", e);
    }
}

testSendMessage();
