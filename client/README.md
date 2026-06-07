# Client — React + TypeScript + Vite

This folder contains the frontend app built with React 18, Vite, TypeScript, and Tailwind CSS. It hosts the UI, hooks, components, and game arenas used by the multiplayer platform.

Quick commands

```bash
# install
cd client && yarn install

# dev server
cd client && yarn dev

# build for production
cd client && yarn build

# run tests
cd client && yarn test
```

Project structure (important folders)

- `src/api/` — `apiFetch` wrapper and socket client
- `src/components/` — UI primitives and game arena components (RPS, TicTacToe, SnakeLadder)
- `src/hooks/` — app hooks: `useSocket`, `useRoomLogic`, `useGameLogic`, `useToast`
- `src/screens/` — route screens (Auth, Lobby, Room, Game)
- `src/store/` — Zustand stores for auth, room, and game UI
- `src/types/` — shared TypeScript types and runtime guards

Testing

- Tests are written with `vitest`. Unit tests live beside components and hooks as `*.test.tsx`.

Notes & conventions

- Uses Vite's `react-jsx` transform; importing `React` in components is not required for JSX.
- Socket event listeners are typed but some runtime casts are used where Socket.IO generics are too strict for simple test mocks.
- `client/tsconfig.json` excludes test files from the production `tsc` build to avoid test-only globals during CI builds.

If you want a README section added (deployment, environment variables), tell me which details to include.
