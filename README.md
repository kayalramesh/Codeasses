# Stratix

Stratix is a rigorous testing platform designed to evaluate deep conceptual understanding of algorithms through hidden test cases and strict execution limits. 

## Features

- **Multi-language Support:** Write solutions in Python 3, Java, C, and C++.
- **Isolated Sandboxing:** Uses the public Piston API for secure, timeout-restricted code execution.
- **Hidden Test Cases:** Students are graded against 30 hidden test cases per problem, ensuring logic holds for edge cases, large inputs, and non-standard data.
- **Split-Screen Workspace:** A LeetCode-style IDE experience with Monaco Editor, problem constraints, and sample test case execution.

## Requirements

- Node.js (v18 or higher recommended)
- npm

## Setup Instructions

### 1. Backend Setup

The backend uses Express, Prisma, and SQLite.

```bash
cd server
npm install
```

Generate the Prisma Client and apply the SQLite schema:
```bash
npx prisma db push
```

Seed the database with the required problems and hidden test cases:
```bash
node src/seed/seed.js
```

Start the server:
```bash
node src/index.js
```
The API will run on `http://localhost:3001`.

### 2. Frontend Setup

The frontend uses React, Vite, and Tailwind CSS v4.

In a new terminal window:
```bash
cd client
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Architecture Details

- **Frontend:** React + Vite + Tailwind CSS + React Router + Monaco Editor.
- **Backend:** Node.js + Express.
- **Database:** SQLite managed via Prisma ORM.
- **Code Execution:** Offloaded to the public [Piston Code Execution API](https://emacs.piston.rs/api/v2/execute), ensuring that the server host does not need Docker installed locally while maintaining strict isolation, memory limits (256MB), and wall-clock timeouts (3s run, 10s compile).

See `DECISIONS.md` for specific engineering choices made during development.
