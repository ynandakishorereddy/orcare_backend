<div align="center">
  <!-- <img src="docs/assets/banner.png" alt="ORCare Banner" width="100%"> -->
  <h1>🦷 ORCare Backend</h1>
  <p><strong>Intelligent Oral Health & Dental Assistant API</strong></p>

  [![Node.js CI](https://github.com/ynandakishorereddy/orcare_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ynandakishorereddy/orcare_backend/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#documentation">Documentation</a>
  </p>
</div>

---

## 📖 Overview

ORCare is a robust, production-ready backend API that powers a comprehensive dental and oral health application. It features a conversational AI assistant (powered by Google Gemini), personalized learning modules, interactive quizzes, and secure user management via Google Sign-In.

## ✨ Features

- 🔐 **Secure Authentication**: Google Sign-In with Custom JWT issuance. No passwords stored.
- 🤖 **AI Dental Assistant**: A highly specialized conversational agent dedicated to oral health, maintaining full session history.
- 📚 **Content Delivery**: Educational modules mapping various dental diseases and learning categories.
- 📝 **Quizzes**: Interactive quizzes for users to test their oral hygiene knowledge.
- 🛡️ **Enterprise Security**: Built-in DDoS protection, strict CORS, request validation, and HTTP security headers.

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL (Supabase)](https://supabase.com/)
- **Authentication**: Google OAuth 2.0 (`google-auth-library`) & JWT
- **AI Engine**: Google Generative AI (`gemini-2.5-flash`)
- **Security**: `helmet`, `express-rate-limit`, `express-validator`

## 📂 Folder Structure

```text
├── android_client/     # Example Android implementations
├── config/             # Database and Supabase configurations
├── controllers/        # Core business logic
├── docs/               # Technical documentation
├── middleware/         # Security and authentication middleware
├── routes/             # API routing and validation schemas
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Supabase Account (for PostgreSQL)
- Google Cloud Console Account (OAuth Client ID & Gemini API Key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ynandakishorereddy/orcare_backend.git
   cd orcare_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and populate it with your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Run the Server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

### 🩺 Health Check
Verify the server is running and the database is connected by navigating to:
`GET http://localhost:3000/api/health`

## ☁️ Deployment (Render/Railway)

1. Connect your GitHub repository to your hosting provider.
2. Set the build command to `npm install` (or `npm ci`).
3. Set the start command to `npm start`.
4. Inject all environment variables from `.env` directly into the hosting provider's dashboard.
5. (See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions).

## 📚 Documentation

For deep technical dives, refer to our dedicated documentation files:
- [API Endpoints](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [Technical Security](docs/SECURITY.md)

## 🗺 Future Roadmap
- [ ] Implement push notifications for daily brushing reminders.
- [ ] Add image-upload capabilities for the AI to analyze dental x-rays or photos.
- [ ] Build a web-based administrative dashboard.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/ynandakishorereddy/orcare_backend/issues). 
Please read the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License
This project is [MIT](LICENSE) licensed.

---
*Created by [ORCare Team](https://github.com/ynandakishorereddy)*
