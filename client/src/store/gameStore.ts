import { create } from 'zustand'

export interface GameStoreState {
  board: Record<number, string>;
  isMyTurn: boolean;
  gameStatus: string;
  setGameState: (state: Partial<GameStoreState>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  board: {},
  isMyTurn: false,
  gameStatus: 'WAITING',
  setGameState: (newState) => set((prev) => ({ ...prev, ...newState })),
  resetGame: () => set({ board: {}, isMyTurn: false, gameStatus: 'WAITING' }),
}))
