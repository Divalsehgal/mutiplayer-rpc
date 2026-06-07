# 🎮 Multiplayer Game Arena

This repository is a monorepo that contains the frontend (`client/`) and backend (`server/`) for a real-time multiplayer platform built with Socket.io and TypeScript.

This README provides a short overview, architecture summary, and the common commands to develop, build, and test the project.

---

## Repository layout

- `client/` — React + Vite frontend (TypeScript, Tailwind, Framer Motion). Contains UI, hooks, components, and Vitest tests.
- `server/` — Express + Socket.io backend (TypeScript). Contains socket handlers, game registry, controllers, services, repositories, and Jest tests.
- `README.md` — this file

---

## Quick start

1. Install dependencies and run both projects locally:

```bash
# From repo root
cd server && yarn install
cd ../client && yarn install
```

2. Start development servers (open two terminals):

```bash
# Terminal A (server)
cd server
yarn dev

# Terminal B (client)
cd client
yarn dev
```

3. Build for production:

```bash
# client
cd client && yarn build

# server
cd server && yarn build
```

---

## Tests

Run tests from the repo root:

```bash
yarn test        # runs client & server tests
cd client && yarn test    # run Vitest
cd server && yarn test    # run Jest
```

---

## Architecture & Code Structure (summary)

- Frontend (`client/src`)
  - `api/` — small fetch wrapper and typed API helpers
  - `components/` — reusable UI components and arena game components
  - `hooks/` — application hooks (`useSocket`, `useRoomLogic`, `useGameLogic`)
  - `screens/` — top-level routes (Auth, Lobby, Room, Game)
  - `store/` — Zustand stores for auth, room, game state
  - `types/` — shared TypeScript types and guards

- Backend (`server/src`)
  - `socket/` — Socket.io handlers and event routing
  - `games/` — game engines and `gameRegistry` for plug-and-play games
  - `repositories/` — in-memory room repository and persistence adapters
  - `controllers/` & `services/` — HTTP endpoints and business logic
  - `routes/` — Express route bindings
  - `utils/` — logger, helpers

Key patterns:

- Game Registry: central map of `gameType -> engine` so new games can be added as independent modules.
- Room Store: in-memory store for active sessions; persistence is handled separately (MongoDB used for user data and longer-term storage).

---

## Notes & Maintenance

- Tests are run in CI; ensure Vitest and Jest tests pass before merging.
- The Room store is intentionally in-memory for speed; consider persistent storage for production.

If you want, I can also open a PR with these README updates.
