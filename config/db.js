const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client;

const connectDB = async () => {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
    }

    client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      db: {
        schema: 'public'
      }
    });

    // Test connection
    const { data, error } = await client
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Query Error:', error);
      throw error;
    }
    
    console.log('✅ Supabase PostgreSQL Connected Successfully!');
    console.log('🔔 Connection verified');

    return client;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};

module.exports = { connectDB, client };
