# ORCare API Documentation

## Base URL
All API requests should be prefixed with `/api`. For local development, this is typically `http://localhost:3000/api`.

## Headers
Protected routes require the Authorization header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/api/auth`)

### POST `/google`
Validates a Google ID Token, creates a user if they do not exist, and returns a session JWT.
*   **Body**: `{ "idToken": "string", "language": "string (optional)" }`
*   **Response**: `{ "success": true, "token": "jwt", "user": { ... } }`

### GET `/me` (Protected)
Returns the currently authenticated user's profile based on the provided JWT.
*   **Response**: `{ "success": true, "user": { ... } }`

---

## 2. User Endpoints (`/api/user`)

### PUT `/profile` (Protected)
Updates the user's profile information. Emails and Google IDs cannot be updated.
*   **Body**: `{ "name": "str", "age": int, "gender": "str", "district": "str", "state": "str", "language": "str", "profileImageUri": "str" }`
*   **Response**: `{ "success": true, "message": "...", "user": { ... } }`

### DELETE `/` (Protected)
Permanently deletes the user's account and cascades the deletion to their chat sessions, messages, and quizzes.
*   **Response**: `{ "success": true, "message": "Account deleted successfully" }`

---

## 3. Chat Endpoints (`/api/chat`)

### POST `/` (Protected)
Sends a message to the Gemini AI Dental Assistant.
*   **Body**: `{ "sessionId": "str", "message": "str" }`
*   **Response**: `{ "success": true, "text": "AI Response" }`

### GET `/sessions` (Protected)
Retrieves a list of the user's chat sessions.

### GET `/history?sessionId=<id>` (Protected)
Retrieves the message history for a specific chat session.

### DELETE `/session` (Protected)
Deletes a specific chat session and its messages.
*   **Body**: `{ "sessionId": "str" }`

---

## 4. Quiz Endpoints (`/api/quiz`)

### POST `/submit` (Protected)
Submits a completed quiz.
*   **Body**: `{ "questions": [...], "score": int }`
*   **Response**: `{ "success": true, "quiz": { ... } }`

### GET `/modules` (Protected)
Retrieves the user's quiz history.

### GET `/:id` (Protected)
Retrieves a specific quiz by its database ID.

---

## 5. Content Endpoints (`/api/content`)

### GET `/categories`
Retrieves learning categories.

### GET `/module/:id`
Retrieves diseases modules.

### POST `/feedback` (Protected)
Submits user feedback.

---

## 6. System Endpoints

### GET `/api/health`
Checks server and database connection status.

### GET `/api/version`
Returns the minimum supported API version.
