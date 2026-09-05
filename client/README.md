# Client — React + TypeScript + Vite

Single-page app: React 18 + Vite + TypeScript + Tailwind + Framer Motion,
talking to the backend over a typed REST layer (`apiFetch`) for auth/profile
and a typed Socket.IO client for everything room/game related.

## Quick commands

```bash
cd client
yarn install
yarn dev       # vite dev server
yarn build     # tsc && vite build
yarn test      # vitest run
yarn test:watch
yarn lint
```

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_SERVER_URL` | Backend base URL, used by both `apiFetch` and the Socket.IO client (default `http://localhost:3030`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client id for `<GoogleLogin>` |

---

## Project layout

```
client/src/
  api/
    client.ts        # apiFetch(): fetch wrapper with cookie-based auth + 401 refresh-and-retry
    socket.ts         # the one Socket.IO client instance + connectSocket()/getPlayerUid()
  components/
    ui/               # shadcn-style primitives (button, card, input, toast, ...)
    GameHeader/        # shared scoreboard header for all three games
    RPSArena/, SnakeLadderArena/, TicTacToeArena/   # per-game board UI
    InactivityWarning/ # room-TTL countdown banner
    SessionSupersededScreen/  # "you're active in another tab" screen
    Sidebar.tsx, ProtectedRoute.tsx
  hooks/
    useSocket.ts        # owns the socket connect/reconnect lifecycle + auth handshake
    useRoomConnection.ts # shared: register+join, room-store sync, TTL countdown, leave/extend
    useRoomLogic.ts      # RoomScreen-only: wraps useRoomConnection, adds "start game" + auto-nav to /game
    useGameLogic.ts      # GameScreen-only: wraps useRoomConnection, adds move handlers + auto-nav to /room
    useSocketEvent.ts    # typed socket.on/off effect helper
    use-toast.ts         # toast state (shadcn pattern); rendered by <Toaster /> in App.tsx
  screens/
    AuthScreen/, LobbyScreen/, RoomScreen/, GameScreen/
  store/
    auth/             # Zustand: user, session state, login/logout/checkAuth
    room/             # Zustand: current room, TTL warning, round history
  types/              # RoomState/Player/GameState + the Socket.IO event map
```

---

## Auth flow

`store/auth` is the single source of truth for identity. `App.tsx` calls
`checkAuth()` on mount, which hits `GET /user/profile` — the server reads the
`access_token` httpOnly cookie, so this "just works" across reloads without
the client ever holding a token in memory. `ProtectedRoute` gates `/`,
`/room/:id`, and `/game/:id` on `isAuthenticated`; unauthenticated visits
redirect to `/login` carrying the original location in router state, and
`AuthScreen` reads that state back out so a shared room link survives a
login round-trip instead of dumping the user at the lobby.

`apiFetch` (`api/client.ts`) is a thin `fetch` wrapper that always sends
`credentials: 'include'`. On a `401` it transparently calls `POST
/auth/refresh` (de-duplicated so concurrent 401s share one refresh call) and
retries the original request once; if refresh fails it logs out and
redirects to `/login`.

## Socket connection lifecycle

`api/socket.ts` exports one module-level `Socket` instance (`autoConnect:
false`) plus `getPlayerUid()`, which lazily creates and caches an anonymous
id in `sessionStorage` for players without an account. `useSocket()` (called
once, globally, from `App.tsx`) owns the actual connect/reconnect: it calls
`connectSocket(accessToken, playerUid)` whenever identity changes, which
force-reconnects the socket if the auth payload actually changed so the
server-side handshake always re-verifies with current credentials.

## Room/Game connection

`useRoomConnection(roomId)` is the shared core used by both the lobby and
the in-game screen: register → join-room on mount (gated on the socket
actually being connected), keep the room store in sync with `room-update` /
`ROOM_WARNING` / `room-error` / `session-taken-over`, run the TTL countdown,
and expose `handleExtendSession`/`handleLeave`. `useRoomLogic` (Room screen)
and `useGameLogic` (Game screen) each wrap it and add only what differs:
which screen to auto-navigate to when `room.status` changes, and — for the
game screen — the per-move socket emits (`handleRPSMove`,
`handleSnakeLadderMove`, `handleTicTacToeMove`, `handleNextRound`).

If the same player opens the room from a second tab or device,
`session-taken-over` fires on the now-stale tab: it shows a toast and swaps
to `<SessionSupersededScreen />` instead of continuing to render a room that
will never update again.

## Games

Each game arena (`components/*Arena`) is a dumb renderer driven entirely by
server-pushed `gameState` + a handful of move callbacks — no game rules live
on the client. `GameScreen` picks the right arena via a `gameType ->
component` map, so adding a new game client-side is "add one arena component
+ one registry entry," mirroring the server's `gameRegistry`.

## Testing

Vitest + Testing Library. Test files are colocated as `<name>.test.ts(x)` —
**note the exact naming**: Vitest's default `include` glob only picks up
files matching `*.test.ts(x)`, not a bare `test.ts(x)`; a same-directory file
literally named `test.tsx` will sit in the repo, look like it's covering the
component, and silently never run. Double-check `yarn test`'s file count
against what you expect when adding a new test file.

## Deployment notes

`public/_redirects` rewrites all paths to `index.html` (Netlify/Cloudflare
Pages style SPA fallback) — this is required for shared room links
(`/room/:id`) to work when hit directly rather than via client-side
navigation; without it a static host will 404 on refresh or on a pasted
link.
