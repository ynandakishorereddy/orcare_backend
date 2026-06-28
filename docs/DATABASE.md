# Database Schema

ORCare utilizes Supabase (PostgreSQL) for all relational data storage.

## ER Diagram (Conceptual)

```mermaid
erDiagram
    USERS ||--o{ CHAT_SESSIONS : owns
    USERS ||--o{ QUIZZES : takes
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains

    USERS {
        uuid id PK
        string name
        string email
        string profile_image_uri
        string language
        boolean is_email_verified
        int age
        string gender
        string district
        string state
    }

    CHAT_SESSIONS {
        uuid id PK
        uuid user_id FK
        string session_id
        string title
        timestamp created_at
    }

    CHAT_MESSAGES {
        uuid id PK
        uuid chat_session_id FK
        string text
        boolean is_from_user
        timestamp timestamp
    }

    QUIZZES {
        uuid id PK
        uuid user_id FK
        int score
        jsonb questions
        timestamp created_at
    }
```

## Setup Notes
*   We bypass Supabase Row Level Security (RLS) policies by utilizing the `SUPABASE_SERVICE_ROLE_KEY` directly on the backend. 
*   The backend validates the JWT and handles authorization natively, meaning the PostgreSQL tables do not need complex RLS rules for this implementation.
