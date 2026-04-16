const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    db: {
        schema: 'public'
    }
});

// Test connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('COUNT(*)', { count: 'exact' })
            .limit(1);
        
        if (error) throw error;
        console.log('✅ Supabase PostgreSQL Connected Successfully!');
        return true;
    } catch (error) {
        console.error('❌ Supabase Connection Error:', error.message);
        return false;
    }
};

module.exports = { supabase, testConnection };
