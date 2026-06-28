# ORCare Architecture

The ORCare backend is a monolithic Express.js API designed to securely serve a mobile frontend while leveraging cloud services for data persistence and AI capabilities.

## High-Level Architecture

```mermaid
graph TD
    Client[Mobile/Web Client] -->|HTTPS REST| API(Express API Server)
    API -->|Google Auth| Google(Google OAuth Service)
    API -->|PostgreSQL Queries| DB[(Supabase DB)]
    API -->|Prompt & History| Gemini(Google Gemini AI)
    
    subgraph Express Backend
        Router(Routes) --> Middleware(Auth / Validation / Security)
        Middleware --> Controllers(Business Logic)
    end
```

## Authentication Flow

With the transition to Google Sign-In, the flow is as follows:

```mermaid
sequenceDiagram
    participant Client
    participant Google
    participant ORCare Backend
    participant Supabase

    Client->>Google: 1. Request Sign In
    Google-->>Client: 2. Return Google ID Token
    Client->>ORCare Backend: 3. POST /api/auth/google (ID Token)
    ORCare Backend->>Google: 4. Verify ID Token signature
    ORCare Backend->>Supabase: 5. Upsert User (Email/Name)
    ORCare Backend-->>Client: 6. Return Custom JWT
    Client->>ORCare Backend: 7. Authenticated Requests (Bearer JWT)
```

## Directory Structure

*   **`server.js`**: The entry point. Handles middleware initialization (Helmet, CORS, Rate Limit) and mounts routes.
*   **`routes/`**: Defines the URL endpoints and HTTP verbs, binding them to specific controller functions. Also applies `express-validator` rules.
*   **`controllers/`**: Contains the core business logic.
    *   `authController.js`: Google OAuth verification and custom JWT issuance.
    *   `userController.js`: Profile management and account deletion.
    *   `chatController.js`: Integrates with Gemini AI and persists chat history.
    *   `quizController.js` & `contentController.js`: Handle educational content and quiz tracking.
*   **`middleware/`**: 
    *   `authMiddleware.js`: Validates the custom JWTs before allowing access to protected routes.
*   **`config/`**:
    *   `db.js` & `supabase.js`: Initializes the Supabase PostgreSQL client connection.
