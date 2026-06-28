# ORCare Backend

ORCare is a backend API powering a comprehensive dental and oral health application. It features a conversational AI assistant (powered by Google Gemini), personalized learning modules, quizzes, and secure user management.

## Tech Stack
*   **Runtime Framework**: Node.js & Express.js
*   **Database**: PostgreSQL hosted on Supabase (using `@supabase/supabase-js`)
*   **Authentication**: Google Sign-In with Custom JWT issuance
*   **AI Integration**: Google Generative AI (`gemini-flash-latest`)
*   **Security**: Helmet, express-rate-limit, express-validator

## Features
*   **Secure Authentication**: Streamlined Google Sign-In workflow.
*   **AI Dental Assistant**: A highly specialized conversational agent dedicated to oral health.
*   **Content Delivery**: Modules for diseases and learning categories.
*   **Quizzes**: Users can take quizzes and track their history.

## Setup Instructions

1.  Clone the repository and install dependencies:
    ```bash
    npm install
    ```
2.  Set up environment variables in `.env` based on `.env.example`:
    ```
    PORT=3000
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    GOOGLE_CLIENT_ID=your_google_oauth_client_id
    CORS_ORIGINS=http://localhost:3000,http://10.0.2.2:3000
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Documentation
*   [API Documentation](docs/API.md)
*   [Architecture Overview](docs/ARCHITECTURE.md)
*   [Deployment Guide](docs/DEPLOYMENT.md)
