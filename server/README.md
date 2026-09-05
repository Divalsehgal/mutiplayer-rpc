# Server — Express + Socket.IO (TypeScript)

Real-time multiplayer backend. Express handles authentication and account HTTP
routes; Socket.IO handles everything room- and game-related. The server is
authoritative for all game state — clients only ever send *intents* (a move, a
ready-check, a join), never state.

`server/server.ts` is the entry point: it wires Express + Socket.IO on one
HTTP server, constructs the in-memory `RoomRepository`, calls `initSocket(...)`,
and starts two `setInterval` maintenance loops (room TTL/idle cleanup and
disconnect-grace-period cleanup).

---

## Quick commands

```bash
cd server
yarn install
yarn dev      # tsx watch server.ts
yarn build    # tsc -> dist/
yarn start    # node dist/server.js
yarn test     # jest
yarn lint
```

## Environment variables

| Variable | Purpose | Default (dev) |
|---|---|---|
| `PORT` | HTTP/Socket.IO port | `3030` |
| `CORS_ORIGIN` | Allowed client origin (trailing slash stripped) | `http://localhost:5173` |
| `MONGO_DB_URI` | Mongo connection string. If unset, the server still starts (rooms/games work) but auth routes that touch the DB will fail. | — |
| `DB_NAME` | Appended to `MONGO_DB_URI` | — |
| `JWT_SECRET` | Access token signing secret. **Required in production** (throws on boot without it); falls back to a dev default otherwise. | `access_secret_key` (dev only) |
| `REFRESH_TOKEN_SECRET` | Refresh token signing secret. Same production requirement as above. | `refresh_secret_key` (dev only) |
| `GOOGLE_CLIENT_ID` / `CLIENT_ID` | Google OAuth client id | — |
| `GOOGLE_CLIENT_SECRET` / `CLIENT_SECRET` | Google OAuth client secret | — |
| `NODE_ENV` | `production` toggles secure/`SameSite=None` auth cookies and enforces the JWT secrets above | — |

`ROOM_IDLE_MS` (15 min) and `GRACE_PERIOD_MS` (2 min) are constants in
`src/config/index.ts`, not env vars.

---

## Project layout

```
server/
  server.ts                  # entry point, Express+Socket.IO wiring, maintenance timers
  src/
    config/                  # PORT, CORS_ORIGIN, ROOM_IDLE_MS, GRACE_PERIOD_MS
    models/
      auth/                  # Mongoose Auth doc (password hash, googleId, getJWT())
      user/                  # Mongoose User doc (profile: user_name, email, avatar, bio)
      session/                # Mongoose Session doc (refresh token, TTL-indexed, auto-expires)
      room/, player/, game/   # plain TS interfaces for in-memory Room/Player/GameState
      index.ts                # re-exports + Logger/GameRegistry types
    routes/
      auth/, user/             # Express routers, mounted on the HTTP app
      room/, game/             # NOT Express routers - these register Socket.IO event
                               #   listeners (registerRoomRoutes/registerGameRoutes),
                               #   called once per connection from src/socket/index.ts
    controllers/
      auth/                   # signup/signin/logout/refresh/Google OAuth handlers
      user/                   # profile get/update
      room/, game/             # Socket.IO controllers (see below)
    services/
      auth/                   # AuthService: bcrypt, JWT issuance, session persistence/rotation
      user/
      room/                   # RoomService: create/join/leave/extend + score/state reset
      game/                   # GameService: authoritative move/ready validation + dispatch
    repositories/room/        # in-memory RoomRepository (see "Room lifecycle" below)
    middlewares/               # authMiddleware (HTTP), validate (zod)
    socket/                    # initSocket(): auth middleware + event registration
    games/                     # per-game rule engines + the game registry
    dtos/, validators/         # request/response shapes and zod schemas
    utils/                     # logger, authTokens (JWT sign/verify), sendError
```

---

## Authentication

Two independent auth surfaces feed one shared identity:

- **HTTP** (`/auth/*`, `/user/*`): email/password signup+signin, Google OAuth
  (`/auth/google`, verified via `google-auth-library`), refresh, logout.
  `AuthService` hashes passwords with bcrypt, issues a short-lived access
  token (1h) and a long-lived refresh token (7d) via `utils/authTokens.ts`,
  and persists refresh tokens in the `Session` collection (Mongo TTL-indexes
  them so expired sessions self-delete). Refreshing **rotates** the session's
  refresh token rather than minting a new row.
- Tokens are set as **httpOnly cookies** (`access_token`, `refresh_token`) via
  `controllers/auth/helpers.ts` — never returned in the JSON body. This is
  deliberate: it keeps tokens out of reach of any XSS in the client bundle.
  `authMiddleware` (HTTP) and the Socket.IO auth middleware both accept the
  same cookie.
- **Socket.IO**: `initSocket`'s `io.use(...)` middleware reads a token from
  either `socket.handshake.auth.token` or the `access_token` cookie on the
  handshake, verifies it with the same secret as HTTP, and sets
  `socket.data.playerUid`/`socket.data.user`/`socket.data.avatar`. If no
  token is present, it falls back to an anonymous `playerUid` supplied by the
  client (`socket.handshake.auth.playerUid`) — anonymous play is supported at
  the transport layer, though the current client always authenticates first
  via `ProtectedRoute`.

## Room lifecycle

`RoomRepository` (in `repositories/room/`) is a single in-memory store, built
as three mixed-in layers for readability, not for runtime polymorphism:

- `base/` — the `Map`s (`rooms`, `playerToRoom`, `socketToPlayer`) and simple
  lookups (`getRoom`, `getPlayerBySocket`, `countActivePlayers`, ...).
- `actions/` — `createRoom`, `joinRoom`, `leaveRoom`, spectator promotion.
- `maintenance/` — disconnect/TTL bookkeeping: `markSocketDisconnected`,
  `incrementScore`, `updateGameState`, `extendRoom`, `cleanupDisconnectedPlayers`,
  `cleanupIdleRooms`, `checkRoomTTLs`.

Key rules:

- **One active room per `playerUid`** — `playerToRoom` is a single global
  map, so a player can't be in two rooms at once (by design).
- **Reconnection is just a rejoin.** There's no separate "reconnect" RPC —
  `joinRoom` detects an existing player by `playerUid` and, if found, rebinds
  their `socketId` and flips `status` back to `online` instead of adding a
  duplicate. This is what makes page refresh and "open the room link again"
  work identically.
- **Same player, second tab/device**: `joinRoom` also returns the *previous*
  socket id it just superseded. `RoomController` uses that to emit
  `session-taken-over` to the old socket, so the stale tab can show a clear
  "you're active elsewhere" state instead of silently going dead.
- **Room capacity vs. spectators**: `maxPlayers` caps the `player` role only.
  Once full, new joiners become `spectator`s automatically — there's no hard
  "room full" rejection. If an active player leaves, `promoteSpectators`
  fills the vacated slot from the spectator queue (join order).
- **Cleanup, run every 5–10s from `server.ts`**:
  - `cleanupDisconnectedPlayers(GRACE_PERIOD_MS)` — removes players who've
    been offline past the grace period (frees their slot for promotion).
  - `checkRoomTTLs()` — emits `ROOM_WARNING` ~60s before a room's
    `expiresAt`, and `room-error {code: ROOM_EXPIRED}` + deletes the room
    once it passes. `expiresAt` is refreshed on join, on every game-state
    update, and on an explicit `extend-room` from the client.
  - `cleanupIdleRooms(ROOM_IDLE_MS)` — hard cap on total inactivity.

## Game engines & authority

`GameRegistry` (`models/game/Game.ts`) is the contract every game module
implements: `getInitialState()`, `handleReady()`, `handleMove()`,
`projectPublicState()`. `games/registry.ts` maps `gameType string -> engine`,
so adding a new game is "write a module matching the interface, add one line
to the registry" — no other file needs to know it exists.

Current engines: `games/rps`, `games/tic-tac-toe`, `games/snake-ladder`.

`GameService.handleMove`/`handleReady` are the single choke point all engine
calls go through, and they enforce one authority rule before anything else
runs: **the caller must be a seated player (`role === 'player'`) in the
room.** Spectators can watch (`projectPublicState` is what they receive over
`room-update`) but cannot move, ready-up, or influence scoring — this is
enforced server-side regardless of what the client sends.

`projectPublicState` is also how games hide information per-viewer (e.g. RPS
masks an opponent's choice as `"hidden"` until both players have moved).

## Socket event surface

Client → server events registered in `routes/room/index.ts` and
`routes/game/index.ts`, dispatched through thin `RoomController`/
`GameController` classes into `RoomService`/`GameService`:

- `create-room`, `join-room`, `leave-room`, `extend-room`, `get-public-rooms`
- `game-ready`, `game-move`
- `register` — a no-op handshake ack (`socket.on("register", ...)` in
  `socket/index.ts` itself); the client calls it before `join-room` on every
  mount so the join always happens against a live, acknowledged connection.

Server → client: `room-update` (personalized per-socket via
`getPublicRoomState`), `ROOM_WARNING`, `room-error`, `session-taken-over`.

Controllers stay thin on purpose: they translate socket events to
service calls and broadcast the result — they don't contain game rules or
room-lifecycle logic themselves.

## Testing

Jest, colocated `*.test.ts` next to the code under test. Run `yarn test` from
`server/`. Mocks are hand-rolled per layer (repository mocked in service
tests, service mocked in controller tests) rather than a shared test harness.
