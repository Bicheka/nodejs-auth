# Auth Microservice

A lightweight, reusable authentication microservice built with **Express.js**, **PostgreSQL**, and **JWT authentication**. It supports:

* Email + Password sign up & login
* OAuth providers (Google, GitHub, LinkedIn, etc.)
* Access tokens + Refresh tokens
* Session-based or token-based implementations
* Reusable architecture so any app (web, mobile, backend) can integrate with your auth server

---

## 🚀 Features

* **User Registration & Login** with hashed passwords (bcrypt)
* **OAuth Login** (Google, GitHub, etc.) via Passport or custom handlers
* **JWT Tokens** (access + refresh)
* **Session support** (optional)
* **PostgreSQL database migrations**
* **Modular folder structure** for easy scaling
* **Can be used by any other service** through simple HTTP endpoints

---

## 📁 Project Structure

```
.
├── src
│   ├── config
│   │   └── passport.ts
│   ├── controllers
│   │   ├── auth.controller.ts
│   ├── middlewares
│   │   └── auth.middleware.ts
│   ├── routes
│   │   └── auth.routes.ts
│   ├── services
│   │   └── auth.service.ts
│   ├── db
│   │   ├── migrations
│   │   └── index.ts
│   └── server.ts
├── sql
│   └── *.sql
├── .env
├── package.json
└── README.md
```

---

## 🧠 How It Works

### 1. User Authentication Flow

* User signs up or logs in.
* Server validates credentials.
* Server returns:

  * **Access Token (short-lived)**
  * **Refresh Token (long-lived)**
* Client stores tokens (HTTP-only cookie or secure storage).

### 2. OAuth Flow

* Client redirects user to Google/GitHub.
* Provider returns a `code`.
* Server exchanges the `code` for user info + tokens.
* Server creates or finds a user.
* Server returns access/refresh tokens.

---

## 🛠️ Installation

### 1. Clone the repo

```
git clone https://github.com/yourname/auth-microservice.git
cd auth-microservice
```

### 2. Install dependencies

```
npm install
```

### 3. Environment variables

Create a `.env` file:

```
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/auth
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
```

---

## 🗄️ Database Setup

Run the SQL migrations:

```
npm run migrate
```

(or use your custom migration script)

---

## ▶️ Running the Server

```
npm run dev
```

Server will start at:

```
http://localhost:4000
```

---

## 🔗 API Endpoints

### **POST /auth/register**

Create account.

```
{
  "email": "test@example.com",
  "password": "123456"
}
```

### **POST /auth/login**

Login with email + password.

### **POST /auth/refresh**

Get new access token.

### **GET /auth/google**

Redirects to Google login.

### **GET /auth/google/callback**

OAuth callback.

### **GET /auth/me**

Returns authenticated user.

---

## 🧩 Integrating With Other Apps

Any app can authenticate against this microservice.

Example (frontend):

```
POST https://auth.yourdomain.com/auth/login
```

Receive tokens → store → use for API requests.

Backend services can validate JWTs with your public secret.

---

## 📦 Future Improvements

* Add rate limiting
* Add email verification
* Add 2FA
* Add admin dashboard

---

## License

MIT
