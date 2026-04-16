# MongoDB to Supabase PostgreSQL Migration Guide

## 📋 Migration Checklist

### Phase 1: Setup (30 minutes)
- [ ] Create Supabase project and PostgreSQL database
- [ ] Get SUPABASE_URL and SERVICE_ROLE_KEY from Supabase dashboard
- [ ] Run SQL schema from `migrations/001_create_tables.sql` in Supabase SQL editor
- [ ] Copy `.env.example` to `.env` and fill in Supabase credentials

### Phase 2: Code Migration (1-2 hours)
- [ ] Run `npm install` to install @supabase/supabase-js
- [ ] Replace MongoDB models with Supabase controllers
- [ ] Update `server.js` to use new Supabase config
- [ ] Update all routes to use new controllers
- [ ] Verify all imports and dependencies

### Phase 3: Data Migration (15-30 minutes)
- [ ] Keep MongoDB connection working temporarily
- [ ] Run migration script: `node scripts/migrateMongoToSupabase.js`
- [ ] Verify data in Supabase tables
- [ ] Compare record counts between MongoDB and Supabase

### Phase 4: Testing (Depends on scope)
- [ ] Test all authentication endpoints
- [ ] Test chat functionality
- [ ] Test quiz submissions
- [ ] Test content retrieval
- [ ] Test user profile updates

### Phase 5: Cleanup (30 minutes)
- [ ] Remove MongoDB dependencies from code
- [ ] Delete old MongoDB model files
- [ ] Update documentation
- [ ] Deploy to production

---

## 🚀 Step-by-Step Migration Instructions

### STEP 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for database initialization (5-10 minutes)
4. Go to **Settings** → **API** to get credentials:
   - `SUPABASE_URL`: Your project URL
   - `SERVICE_ROLE_KEY`: Service role key (keep secret!)

### STEP 2: Create PostgreSQL Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `migrations/001_create_tables.sql`
4. Paste into SQL editor
5. Click **Run**
6. Wait for all tables to be created

### STEP 3: Update Environment Variables

Update `.env` file:

```env
# Remove or comment out:
# MONGO_URI=...

# Add:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

### STEP 4: Install Dependencies

```bash
# Remove MongoDB packages
npm uninstall mongoose mongodb

# Install Supabase client
npm install @supabase/supabase-js

# Verify installation
npm list
```

### STEP 5: Update Server Configuration

In `server.js`:

**BEFORE:**
```javascript
const connectDB = require('./config/db');
// ... later
await connectDB();
```

**AFTER:**
```javascript
const { testConnection } = require('./config/supabase');
// ... later
const isConnected = await testConnection();
if (!isConnected) {
    console.warn('⚠️ Supabase connection failed, but server will continue');
}
```

### STEP 6: Update Routes

Replace route imports:

**BEFORE:**
```javascript
const authController = require('./controllers/authController');
```

**AFTER:**
```javascript
const authController = require('./controllers/authController_supabase');
```

Do this for all routes:
- authRoutes.js → use authController_supabase
- chatRoutes.js → use chatController_supabase
- contentRoutes.js → use contentController_supabase
- userRoutes.js → use userController_supabase
- quizRoutes.js → use quizController_supabase

### STEP 7: Update Middleware

In `routes/authRoutes.js`:

**BEFORE:**
```javascript
const authMiddleware = require('../middleware/authMiddleware');
```

**AFTER:**
```javascript
const authMiddleware = require('../middleware/authMiddleware_supabase');
```

Same for other routes that use authentication.

### STEP 8: Migrate Data from MongoDB

```bash
# Make sure both MONGO_URI and SUPABASE credentials are in .env
node scripts/migrateMongoToSupabase.js
```

**Expected output:**
```
⏳ Connecting to MongoDB...
✅ MongoDB connected

📦 Migrating Users...
Found 50 users
✅ Migrated 50 users

📦 Migrating Diseases...
Found 30 diseases
✅ Migrated 30 diseases

... (more tables)

✅ Migration completed successfully!
```

### STEP 9: Verify Data in Supabase

In Supabase dashboard:

1. Go to **Table Editor**
2. Check each table for data:
   - users: Should have X records
   - chat_sessions: Should have X records
   - diseases: Should have X records
   - learning_categories: Should have X records
   - quizzes: Should have X records
   - feedbacks: Should have X records

3. Run sample queries in SQL Editor:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM chat_sessions;
   SELECT COUNT(*) FROM diseases;
   SELECT COUNT(*) from learning_categories;
   SELECT COUNT(*) FROM quizzes;
   SELECT COUNT(*) FROM feedbacks;
   ```

### STEP 10: Test Endpoints

```bash
npm run dev
```

Test key endpoints:

```bash
# Register
POST http://localhost:3000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "age": 25,
  "gender": "M"
}

# Get diseases
GET http://localhost:3000/api/content/diseases

# Get learning categories
GET http://localhost:3000/api/content/learning-categories

# Submit quiz (with auth token)
POST http://localhost:3000/api/quiz/submit
Authorization: Bearer <token>
{
  "questions": [...],
  "score": 85
}
```

### STEP 11: Deploy to Production

#### Option A: Render

```bash
# 1. Connect GitHub repo to Render
# 2. Set environment variables in Render dashboard:
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=***
# ... other vars

# 3. Deploy
git push origin main
```

#### Option B: Railway

```bash
# 1. Install railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to Railway
railway link

# 4. Set environment variables
railway variables

# 5. Deploy
railway deploy
```

#### Option C: Self-hosted VPS

```bash
# 1. SSH into VPS
ssh user@your-vps.com

# 2. Install Node.js, git
sudo apt update
sudo apt install nodejs npm git

# 3. Clone repository
git clone https://github.com/yourusername/orcare.git
cd orcare/backend

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Add all environment variables

# 6. Install PM2 for process management
npm install -g pm2

# 7. Start application
pm2 start server.js --name "orcare-backend"
pm2 startup
pm2 save

# 8. Setup Nginx reverse proxy
sudo apt install nginx
# Configure nginx to forward requests to localhost:3000
```

---

## ⚠️ Important Notes

### Data Type Conversions

| MongoDB | PostgreSQL | Conversion |
|---------|-----------|------------|
| ObjectId | UUID | Uses string representation |
| Date | TIMESTAMP WITH TIME ZONE | Preserved as-is |
| Array | JSONB | Converted to JSON |
| String (unique) | VARCHAR (UNIQUE) | Preserved with constraint |
| Boolean | BOOLEAN | Preserved as-is |

### UUID Handling

All new records will have auto-generated UUIDs. When migrating from MongoDB:
- User IDs become: `00000000-0000-0000-0000-000000000000` format (converted from ObjectIds)
- Chat messages retain relationships via `chat_session_id` foreign key

### Foreign Keys

Supabase enforces referential integrity with cascade deletes:
- Delete user → Auto-deletes their chats, quizzes
- Delete chat session → Auto-deletes their messages
- Delete learning module → Keep category (no cascade defined)

### Authentication

- Password hashing: bcryptjs (same as before)
- Token generation: JWT (same as before)
- All auth endpoints work identically

---

## 🔍 Troubleshooting

### "Supabase connection failed"

```
Solutions:
1. Check SUPABASE_URL format (should be https://xxxxx.supabase.co)
2. Check SERVICE_ROLE_KEY is correct
3. Verify network access (firewall?)
4. Check database isn't paused
5. Verify tables were created successfully
```

### "Foreign key constraint violation"

```
Solution:
User doesn't exist before creating chat/quiz.
Ensure users are migrated first.
```

### "Duplicate key value violates unique constraint"

```
Solution:
1. Check if data already exists
2. Clear table and re-migrate:
   TRUNCATE table_name CASCADE;
3. Or use INSERT IGNORE (PostgreSQL: ON CONFLICT clause)
```

### "Password verification fails after migration"

```
Solution:
Hash format should be identical.
If not, re-hash passwords:
UPDATE users 
SET password = crypt(password, gen_salt('bf'))
WHERE password NOT LIKE '$2a$%';
```

---

## 📊 Performance Tips

### Indexes Created

- users: email, created_at
- chat_sessions: user_id, session_id
- chat_messages: chat_session_id
- diseases: name
- learning_categories: title
- learning_modules: title
- quizzes: user_id, taken_at
- feedbacks: email, created_at

### Query Optimization

```typescript
// Good: Select only needed columns
supabase
  .from('users')
  .select('id, name, email')  // Not *
  .eq('id', userId)

// Bad: Select all columns
supabase
  .from('users')
  .select('*')
  .eq('id', userId)
```

### Connection Pooling

Supabase includes pgBouncer for automatic connection pooling. No additional configuration needed.

---

## 🔐 Security Checklist

- [ ] SERVICE_ROLE_KEY never committed to Git
- [ ] JWT_SECRET is unique and strong (32+ chars)
- [ ] CORS_ORIGINS limited to known domains
- [ ] Passwords hashed with bcrypt before storage
- [ ] Rate limiting enabled on auth endpoints
- [ ] SQL injection prevention (using parameterized queries)
- [ ] Environment variables not logged
- [ ] HTTPS enforced in production

---

## 📞 Support & Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node-Postgres: https://node-postgres.com/
- @supabase/supabase-js: https://github.com/supabase/supabase-js

---

## ✅ Success Criteria

Migration is successful when:
- [ ] All tables created in Supabase
- [ ] Data migrated from MongoDB
- [ ] All auth endpoints working
- [ ] Chat functionality working
- [ ] Quiz submission working
- [ ] User profiles updating
- [ ] Content retrieval working
- [ ] No MongoDB references in code
- [ ] Deployed to production
- [ ] Performance acceptable (< 200ms response time)

---

**Need help? Check the error logs and review this guide section by section.**
