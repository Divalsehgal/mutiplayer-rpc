# Authentication & Identity System Documentation

This document outlines the architecture, features, and future plans for the authentication system.

## 🏗️ Architecture

The system follows a strict **Layered Architecture** to ensure decoupling and scalability:

- **Delivery Layer (Controllers)**: Handles HTTP concerns, cookies, and responses. (e.g., `AuthController`, `UserController`)
- **Business Layer (Services)**: Orchestrates complex logic, token generation, and cross-service coordination. (e.g., `AuthService`, `UserService`)
- **Data Access Layer (Repositories)**: Abstracts Mongoose queries away from business logic. (e.g., `AuthRepository`, `UserRepository`)
- **Domain Layer (Models)**: Defines the data schema and core business methods (e.g., password hashing, JWT generation).
- **Contract Layer (DTOs & Validators)**: Ensures data integrity via Zod schemas and TypeScript interfaces.

---

## ✅ Completed Features

### 1. Robust Signin / Signup

- Password hashing using `bcrypt`.
- Double Token System: **Access Token** (1 hour) + **Refresh Token** (7 days).
- HTTP-Only Cookies for enhanced security against XSS.

### 2. Validation Layer

- Global Zod validation middleware (`validateRequest`).
- Strict schemas for input validation:
  - Signup (Strong password enforcement, unique username).
  - Signin (Format checks).
  - Profile Update (URL validation for avatars).

### 3. User Profile API

- Separated `UserModel` from `AuthModel` (pointing to the same `User` collection).
- Protected `GET /user/profile` and `PATCH /user/profile` routes.
- `AuthMiddleware` for verifying sessions via cookies or headers.

### 4. Session Management

- **Token Refresh**: Automatic session extension via `/auth/refresh`.
- **Logout**: Complete clearing of security cookies.

---

## 🚀 The Plan: Google SSO (OAuth2)

Our next objective is to integrate Google Single Sign-On to allow users to authenticate without a password.

### Phase 1: Infrastructure

- Set up Google Cloud Console credentials.
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`.

### Phase 2: Implementation Flow

1. **Initiate**: Redirect user to Google's consent screen.
2. **Callback**: Handle Google's redirect with an authorization code.
3. **Verify**: Exchange code for `id_token` and verify user identity via `google-auth-library`.
4. **Link/Sync**:
    - match Google's email with existing DB users.
    - If new, create a user record.
5. **Issue Tokens**: Generate our custom Access/Refresh tokens to start the session.

### Phase 3: Testing & UI

- Verify session persistence across Google and Local logins.
- Ensure profile data (like avatar/name) is correctly synced from Google.
