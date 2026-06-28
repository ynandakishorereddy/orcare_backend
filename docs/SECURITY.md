# Technical Security Overview

This document provides a technical overview of the security measures implemented in the ORCare Backend.

## 1. Authentication
- **Google OAuth 2.0**: We do not store passwords. Users authenticate natively via Google, and the backend verifies the cryptographic signature of the ID Token against Google's public keys.
- **Stateless Sessions (JWT)**: We issue a custom JSON Web Token (JWT) signed by a highly secure `JWT_SECRET`. Tokens are short-lived and cryptographically verifiable.

## 2. API Protection
- **Helmet.js**: Implements robust HTTP headers (HSTS, NoSniff, XSS Filter, Frameguard) to protect against common web vulnerabilities.
- **Express Rate Limit**: All endpoints under `/api/` are rate-limited (default: 100 requests per IP per 15 minutes) to mitigate brute-force and Denial-of-Service (DoS) attacks.
- **CORS Configuration**: Cross-Origin Resource Sharing is strictly limited to authorized client domains defined in `.env`. Wildcard (`*`) is explicitly forbidden.

## 3. Data Sanitization & Validation
- **express-validator**: All incoming payloads (e.g., chat messages, quiz answers) are sanitized and validated to prevent SQL/NoSQL Injection and ensure data integrity before reaching the controllers.

## 4. Dependencies
We utilize GitHub Actions to automatically run `npm audit` and ensure dependencies are secure. Keep the system updated by monitoring Dependabot alerts.
