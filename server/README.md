# **Multiplayer RPC — Server**

## **Overview**

This server powers real-time multiplayer games (RPS, Snake, etc.) using **Socket.IO**.
It manages:

* Rooms
* Players (including reconnect logic)
* Spectators
* Game state
* Game engines (plug-and-play)

# **Server Purpose**

A Node.js + Socket.IO backend responsible for:

* Creating & managing rooms
* Tracking players, spectators, reconnects
* Routing game events to the correct engine
* Storing game state in memory

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

* `playerToRoom : playerUid → roomId`
* `socketToPlayer : socketId → playerUid`

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

---

# **Run (Quick Start)**

```bash
cd server
npm install
node server/server.js
```

Server starts on the configured PORT (default: `3030` or from `.env`).

---

# **Server Folder Structure**

```
server/
│
├── server.js                # Entry point
├── package.json
│
└── src/
    ├── config/
    │   └── index.js         # PORT, CORS, timers, constants
    │
    ├── socket/
    │   ├── index.js         # attachRoomHandlers + attachGameHandlers
    │   ├── roomHandlers.js  # create/join/reconnect/spectate/leave room
    │   ├── gameHandlers.js  # game-move / game-sync router
    │
    ├── core/
    │   ├── roomStore.js     # in-memory room + player store
    │   └── games/
    │       ├── registry.js  # maps gameType → handler
    │       ├── rpsGame.js
    │       └── snakeGame.js
    │
    └── utils/
        └── logger.js        # simple wrapper console logger
```

---

# **Important Notes**

* `playerUid` is **persistent**, stored in browser (localStorage).
* `socketId` is **temporary** and changes every reconnect.
* Game state uses **playerUid** keys, never socketId.
* Entire Room Store is **in-memory** → server restart wipes rooms (expected for MVP).
* Multiple games are plug-and-play through the **game registry**.