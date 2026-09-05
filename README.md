# 🎮 Multiplayer Game Arena

A real-time multiplayer game platform: React/Vite client + Express/Socket.IO
server, TypeScript throughout. Three turn-based games ship today (Rock
Paper Scissors, Tic-Tac-Toe, Snake & Ladder) behind one shared room/lobby/
reconnect system, with account auth (email+password or Google) gating
access.

Deliberately simple by design: one authoritative in-memory room store on a
single server process, no message queue, no microservices, no Redis. See
`server/README.md` for why, and what that trades away.

---

## Repository layout

- `client/` — React + Vite frontend. See [`client/README.md`](client/README.md).
- `server/` — Express + Socket.IO backend. See [`server/README.md`](server/README.md).

---

## Quick start

```bash
# install
cd server && yarn install
cd ../client && yarn install

# run (two terminals)
cd server && yarn dev     # http://localhost:3030
cd client && yarn dev     # http://localhost:5173
```

Each side needs its own `.env` — see the env var tables in
`server/README.md` and `client/README.md`. The server starts fine without
`MONGO_DB_URI` set (rooms/games work; auth routes that touch the DB won't).

```bash
# build
cd client && yarn build
cd server && yarn build

# test
cd client && yarn test    # vitest
cd server && yarn test    # jest
```

---

## How a match happens, end to end

1. **Auth** — sign up/in with email+password or Google, or land on a
   protected route unauthenticated and get redirected to `/login` (the
   original destination is preserved and restored after login — this is
   what makes a shared room link work even for a logged-out visitor). Tokens
   live in httpOnly cookies; the client never touches them directly.
2. **Socket handshake** — once authenticated, the client opens one
   Socket.IO connection carrying the same cookie/token; the server verifies
   it and attaches `playerUid` to the socket for the connection's lifetime.
3. **Create or join a room** — `create-room` picks a `gameType` and spins up
   initial state from that game's engine; `join-room` (used for a fresh
   join, a page refresh, or opening a shared `/room/:id` link directly) adds
   the player, or — if they're already in the room under a different
   connection — rebinds their session to the new socket. A room fills its
   `maxPlayers` slots as `player`s; anyone joining after that watches as a
   `spectator` and gets promoted automatically if a slot opens up.
4. **Lobby → match** — once enough players are in, any player can ready-up;
   the room's status flips to `playing` and every connected client
   auto-navigates from the room screen to the game screen (driven by
   `room.status`, not a manual signal).
5. **Moves** — the client only ever sends an intent (`game-move`,
   `game-ready`); the relevant game engine validates and computes the next
   state server-side, and the server pushes a personalized `room-update` to
   every connected participant (spectators get a redacted view via
   `projectPublicState`). A move from anyone who isn't a seated player is
   rejected before it reaches the engine.
6. **Disconnects & reconnects** — a dropped socket marks the player
   `offline` but keeps their seat for a grace period; refreshing or
   reopening the room link rejoins and restores it. If the same player joins
   from a second tab/device, the *first* tab is notified
   (`session-taken-over`) and shows a dedicated "active elsewhere" screen
   instead of quietly going stale.
7. **Idle/expiry** — inactive rooms warn (`ROOM_WARNING`) and eventually
   expire; any room activity (a join, a move, an explicit "extend") resets
   the clock.

## Design decisions worth knowing about

- **Server-authoritative, always.** No game rule or turn-validity check
  exists on the client — the client renders whatever `gameState` it's
  handed and sends intents. This is enforced by construction: every game
  engine implements the same `getInitialState/handleReady/handleMove/
  projectPublicState` interface, and `GameService` is the one place all of
  them are invoked through.
- **In-memory room store, single process.** Fast and simple; the tradeoff is
  that a server restart drops all active rooms and a horizontal scale-out
  would need a shared store. Account data (users, sessions) is the only
  thing in MongoDB — rooms/games are intentionally not persisted.
- **Cookie-based auth, not client-held tokens.** Access/refresh tokens are
  httpOnly cookies end to end (HTTP routes and the Socket.IO handshake both
  read the same cookie), so the client bundle never holds a bearer token in
  memory or storage.
- **One connection lifecycle hook.** Room screen and game screen share a
  single `useRoomConnection` hook for register/join/sync/leave/extend; each
  screen only adds what's actually different (which route to auto-navigate
  to, and — for the game screen — the per-move emits). See
  `client/README.md`.

## Notes & maintenance

- Test file naming matters on the client: Vitest only picks up
  `*.test.ts(x)`, not a bare `test.ts(x)` — see the note in
  `client/README.md` before adding a new test file.
- The in-memory room store is intentionally ephemeral; don't rely on active
  rooms surviving a server restart or deploy.
