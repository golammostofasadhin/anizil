Contributing to Anizil

First off, thank you for considering contributing to Anizil! 🎉 It's because of contributors like you that this open-source anime streaming platform keeps getting better.

Table of Contents

1. Code of Conduct
2. How Can I Contribute?
   · Reporting Bugs
   · Suggesting Enhancements
   · Pull Requests
3. Development Setup
4. Style Guides
   · Git Commit Messages
   · Code Style
     · Backend (Node.js/Express)
     · Frontend (React)
5. Testing
6. Questions?

---

Code of Conduct

This project and everyone participating in it is governed by the Anizil Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainer.

How Can I Contribute?

Reporting Bugs

· Ensure the bug was not already reported by searching on GitHub under Issues.
· If you're unable to find an open issue addressing the problem, open a new one. Be sure to include:
  · A clear title and description.
  · Steps to reproduce the issue.
  · Your OS, Node.js version, and MySQL version.
  · Any relevant error messages or screenshots.

Suggesting Enhancements

· Open a new issue with your feature request.
· Describe the current behavior and explain which behavior you expected to see and why.
· Explain why this enhancement would be useful to most Anizil users (e.g., "This would improve the admin dashboard by...").

Pull Requests

· Fork the repo and create your branch from main.
· Fill in the required PR template (if one exists).
· Do not include issue numbers in the PR title, but do include them in the description (e.g., "Closes #123").
· Ensure your code passes all tests and follows the style guides below.
· End all files with a newline.

Development Setup

Prerequisites

· Node.js 18+
· MySQL 5.7+ or MariaDB
· npm

Step-by-step

1. Clone the repository
   ```bash
   git clone https://github.com/golammostofasadhin/anizil.git
   cd anizil
   ```
2. Set up the database
   · Create a MySQL database named anizil.
   · Import the schema:
     ```bash
     # Option A — Full dump
     mysql -u root -p anizil < anizil_database.sql
     
     # Option B — Migration script
     cd server
     node migrate.js
     ```
3. Configure environment
   ```bash
   cp .env.example server/.env
   ```
   Edit server/.env with your credentials:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=anizil
   JWT_SECRET=your_jwt_secret_key
   ```
4. Install dependencies
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
5. Run the application
   ```bash
   # Terminal 1 — Backend
   cd server && node index.js
   
   # Terminal 2 — Frontend (dev)
   cd client && npm run dev
   ```
   · Frontend → http://localhost:5173
   · API → http://localhost:3001

Default Admin Account

Email Password
admin@anizil.com admin123

Style Guides

Git Commit Messages

· Use the present tense ("Add feature" not "Added feature").
· Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
· Limit the first line to 72 characters or less.
· Reference issues and pull requests liberally after the first line.
· Consider starting the commit message with an applicable emoji:
  · 🎨 :art: when improving the format/structure of the code
  · 🐛 :bug: when fixing a bug
  · ✨ :sparkles: when introducing a new feature
  · 📝 :memo: when writing docs
  · 🚀 :rocket: when deploying stuff

Code Style

Backend (Node.js/Express)

· Use ESLint (if configured) or follow standard JavaScript conventions.
· Use 2-space indentation.
· Use camelCase for variables and functions, PascalCase for models/classes.
· Write clear JSDoc comments for all routes and utility functions.
· Organize routes by feature (e.g., routes/anime.js, routes/auth.js).

Frontend (React)

· Use functional components with hooks.
· Use Zustand for state management (follow patterns in client/src/store/).
· Use Tailwind CSS for styling — avoid writing custom CSS unless necessary.
· Component file names should be PascalCase (e.g., AnimeCard.jsx).
· Keep components small and focused — create new files for reusable components.

Testing

· Write tests for any new backend API routes or utility functions.
· Ensure the existing test suite passes before submitting your PR.
· (Specific testing command to be added by the maintainer, e.g., npm test).

Questions?

· Feel free to open an issue for any questions.
· You can also reach out to the maintainer (@golammostofasadhin) directly.

---

Again, thank you for contributing to Anizil! 🍿 Your efforts help make free anime streaming accessible to everyone.
