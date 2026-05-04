# 🎮 Multiplayer Game Arena

[![Deployment](https://img.shields.io/badge/Deployment-Live-success)](https://mutiplayer-arena-client.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)

A robust, real-time multiplayer gaming platform built with a modern full-stack architecture. Users can create rooms, invite friends, and play classic games like Tic-Tac-Toe, Rock-Paper-Scissors, and Snake & Ladder with seamless synchronization.

---

## 🚀 Key Features

- **Real-time Synchronization**: Low-latency multiplayer experience powered by Socket.io.
- **Dynamic Game Engines**: Plug-and-play architecture for adding new games easily.
- **Room Management**: Create, join, and manage private/public game rooms with persistent player identities.
- **Spectator Mode**: Allow users to watch live games without participating.
- **Authentication**: Secure onboarding via Google OAuth 2.0 and JWT-based custom auth.
- **Responsive UI**: Optimized for all devices using Tailwind CSS and Framer Motion.
- **State Persistence**: Reconnection logic ensures players can resume games after a temporary disconnect.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Testing**: [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Pino](https://github.com/pinojs/pino)
- **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)

---

## 🎮 Included Games

1.  **Tic-Tac-Toe**: Classic turn-based strategy.
2.  **Rock Paper Scissors**: Quick real-time decision making.
3.  **Snake & Ladder**: Multi-player board game with randomized dice rolls.

---

## 🏗️ Architecture

The project follows a **Monorepo** structure with clear separation between the client and server.

### Backend Design Patterns
- **Controller-Service-Repository**: Ensures clean separation of concerns and high testability.
- **Game Registry Pattern**: Allows for easy extension of game logic without modifying core socket handlers.
- **In-Memory Room Store**: High-performance room management for active sessions.

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Yarn or NPM
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Divalsehgal/mutiplayer-rpc.git
   cd mutiplayer-rpc
   ```

2. **Setup Server**
   ```bash
   cd server
   yarn install
   cp .env.example .env # Configure your environment variables
   yarn dev
   ```

3. **Setup Client**
   ```bash
   cd client
   yarn install
   cp .env.example .env # Configure your environment variables
   yarn dev
   ```

---

## 🧪 Testing

The project maintains high code quality through rigorous testing.

```bash
# Run all tests (from root)
yarn test

# Run client tests
cd client && yarn test

# Run server tests
cd server && yarn test
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

