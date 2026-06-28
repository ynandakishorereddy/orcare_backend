# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete Google Sign-In authentication flow.
- GitHub Actions CI workflow for automated testing and linting.
- Comprehensive API and Architecture documentation.
- `express-rate-limit` for DDoS protection.
- `helmet` for HTTP security headers.
- Health check and version endpoints.

### Changed
- Migrated primary database operations from MongoDB to Supabase PostgreSQL.
- Updated Gemini AI integration to use `gemini-2.5-flash` model.
- Refactored project directory structure and stripped out legacy dependencies (`nodemailer`, `bcryptjs`, old mongoose models).
- Unified configuration into `.env` and `config/` directory.

### Removed
- Legacy Email/Password authentication flow.
- OTP verification flow.
