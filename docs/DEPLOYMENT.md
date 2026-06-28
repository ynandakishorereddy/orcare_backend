# ORCare Deployment Guide

## Prerequisites
*   Node.js (v18+)
*   Supabase Account (for PostgreSQL)
*   Google Cloud Console Account (for OAuth Credentials & Gemini API Key)
*   A hosting provider (e.g., Render, Railway, AWS EC2, or DigitalOcean)

## 1. Environment Preparation
Ensure your production environment variables are securely set. **Never commit the `.env` file**.

```
PORT=8080
NODE_ENV=production

# Supabase DB
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_key

# Security
JWT_SECRET=a_very_long_secure_random_string

# Integrations
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# CORS
CORS_ORIGINS=https://your-frontend-domain.com
```

## 2. Supabase Configuration
1.  In your Supabase project, ensure the following tables exist in the `public` schema:
    *   `users`
    *   `chat_sessions`
    *   `chat_messages`
    *   `quizzes`
2.  Ensure your `SUPABASE_SERVICE_ROLE_KEY` is used in the backend to bypass Row Level Security (RLS) since the backend acts as a trusted server managing its own custom JWT sessions.

## 3. Deployment Steps (General Node.js)

1.  **Clone the Repo**: `git clone <repo-url>`
2.  **Install Production Dependencies**: 
    ```bash
    npm ci --only=production
    ```
3.  **Start the Server**:
    ```bash
    npm start
    ```

## 4. Security Considerations for Production
*   **HTTPS**: Ensure your host forces HTTPS.
*   **CORS**: Strictly define `CORS_ORIGINS` to only allow your specific frontend domains.
*   **Rate Limiting**: The API is configured with `express-rate-limit` (100 requests per 15 minutes by default). Adjust this in `server.js` if necessary for your traffic volume.
*   **Helmet**: Included by default to set security HTTP headers.
