# Anizil - Anime Streaming Portal

Anizil is a full-stack anime streaming platform built with Express.js (backend) and React (frontend). It supports importing anime from external APIs, user authentication, premium subscriptions, and more.

## Features

- **Anime Management** — Add, edit, delete anime with episodes and streaming sources
- **External Import** — Import anime directly from Anikoto API with episodes and embed URLs
- **User Roles** — Super Admin, Content Admin, Moderator, and regular User roles with granular permissions
- **Authentication** — Email/password login and Google OAuth
- **Premium System** — Premium episodes/content with access control and XP-based purchases
- **Watchlist & History** — Track watched episodes and maintain a personal watchlist
- **Achievements** — Gamified XP and achievement system
- **Comments & Reports** — Community moderation tools
- **Redeem Codes** — Generate and manage premium/Xp redeem codes
- **Admin Dashboard** — Full analytics, user management, settings, and moderation panel
- **Responsive Design** — Works on desktop and mobile

## Tech Stack

- **Backend:** Node.js, Express.js, MySQL (mysql2), JWT, Passport.js
- **Frontend:** React, Vite, Tailwind CSS, Zustand, React Router, Framer Motion
- **External APIs:** Anikoto API for anime import

## Installation

### Prerequisites

- Node.js 18+
- MySQL 5.7+ or MariaDB
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/golammostofasadhin/anizil.git
   cd anizil
   ```

2. **Set up the database**
   - Create a MySQL database named `anizil`
   - Import `anizil_database.sql` into your database:
     ```bash
     mysql -u root -p anizil < anizil_database.sql
     ```
   - Or run the migration script:
     ```bash
     cd server
     node migrate.js
     ```

3. **Configure environment variables**
   ```bash
   cp .env.example server/.env
   ```
   Edit `server/.env` with your settings:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=anizil
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd server && node index.js

   # Terminal 2 - Frontend (development)
   cd client && npm run dev
   ```

   The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

## Default Admin Access

- **Email:** admin@anizil.com
- **Password:** admin123

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web Application)
3. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Set the credentials in `server/.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   ```
5. Or configure them via Admin Panel → Settings → OAuth

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/anime` | List anime (with pagination, search, filters) |
| `GET /api/anime/:slug` | Get anime details by slug |
| `GET /api/anime/:id/episodes` | Get episodes for an anime |
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `GET /api/auth/google` | Google OAuth login |
| `POST /api/import/anikoto` | Import anime from Anikoto (admin) |
| `GET /api/admin/dashboard` | Admin dashboard stats |
| `PUT /api/admin/users/:id/role` | Change user role (admin) |

See `API_DOCS.md` for full API documentation.

## Project Structure

```
anizil/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin panel pages
│   │   ├── components/     # Shared components
│   │   ├── store/          # Zustand state stores
│   │   ├── lib/            # API client, utilities
│   │   └── hooks/          # Custom React hooks
│   └── vite.config.js
├── server/                  # Express backend
│   ├── routes/             # API route handlers
│   ├── middleware/          # Auth & admin middleware
│   ├── config/             # Database configuration
│   ├── utils/              # Helper functions
│   └── index.js            # Server entry point
├── anizil_database.sql     # Database schema & seed data
└── README.md
```
