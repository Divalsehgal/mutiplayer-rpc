# **Multiplayer RPC — Server**

## **Overview**

This server powers real-time multiplayer games (RPS, Snake, etc.) using **Socket.IO**.
It manages:

- Rooms
- Players (including reconnect logic)
- Spectators
- Game state
- Game engines (plug-and-play)

# **Server Purpose**

A Node.js + Socket.IO backend responsible for:

- Creating & managing rooms
- Tracking players, spectators, reconnects
- Routing game events to the correct engine
- Storing game state in memory

Useful for any turn-based or action multiplayer game.

---

# **Data Model (Schema)**

### **Room + Player Relationship**

```
┌─────────────┐          ┌───────────────┐
│    ROOM     │ 1      * │    PLAYER     │
│-------------│----------│---------------│
│ id (PK)     │          │ playerUid (PK)│
│ gameType    │          │ name          │
│ status      │          │ socketId      │
│ maxPlayers  │          │ role          │
│ allowSpect  │          │ state         │
│ createdAt   │          └───────────────┘
│ updatedAt   │
└─────────────┘
        │ 1
        │
        ▼
┌───────────────────────────────────────────┐
│                GAMESTATE                  │
│-------------------------------------------│
│ roomId (FK → ROOM.id)                     │
│ moves:  { playerUid: Move }               │
│ scores: { playerUid: Int }                │
│ customState: optional per-game state      │
└───────────────────────────────────────────┘
```

### **In-memory lookup maps**

- `playerToRoom : playerUid → roomId`
- `socketToPlayer : socketId → playerUid`

These allow reconnection and state persistence across tabs.

---

# **Example Flow (RPS Round)**

```
Player 1           Server          RPS Engine           Player 2
   |                 |                  |                  |
   |-- game-move --> |                  |                  |
   |                 |-- handleMove --> |                  |
   |                 |<-- partial ------|                  |
   |                 |
   |                 |<-- waiting --------------------------|
   |                 |                                      |
   |                 |<--------- game-move -----------------|
   |                 |-- handleMove --> |                  |
   |                 |                  |-- compute winner |
   |                 |<----- result ----|                  |
   |<---- result ----|                  |<---- result -----|
   |                 |                                      |
   |                 |-- broadcast updated scores --------- |
```

# Server — Express + Socket.io (TypeScript)

This folder contains the backend code that powers rooms, players, reconnect logic, and game engines. The server is authored in TypeScript and uses `server/server.ts` as the entry point.

Quick commands

```bash
# install
cd server && yarn install

# dev (watch)
cd server && yarn dev

# build
cd server && yarn build

# run tests
cd server && yarn test
```

Project structure (important folders)

- `src/config/` — environment and constants (port, CORS, TTLs)
- `src/socket/` — socket.io setup and event handlers (room, game routing)
- `src/games/` — individual game engines and `gameRegistry`
- `src/repositories/` — in-memory room repository and helpers
- `src/controllers/` & `src/services/` — HTTP controllers and business logic
- `src/routes/` — Express route bindings for auth/user/game endpoints
- `src/utils/` — utilities (logger, helpers)

Design notes

- Game Registry: maps `gameType` to an engine module, enabling new games to be added with minimal changes.
- Room Store: optimized in-memory store keyed by `roomId` and `playerUid` for fast lookups and reconnection handling. Persistent storage is used for user/account data (MongoDB via Mongoose).
- Socket events are the primary surface for real-time gameplay; HTTP routes are used for auth and account management.

Important: the in-memory Room Store will be cleared on server restarts. For production, consider a persistence layer or shared session store.
