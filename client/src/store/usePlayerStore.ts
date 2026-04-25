import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

interface PlayerStore {
  name: string;
  playerUid: string;
  setName: (name: string) => void;
}

/**
 * Player Store
 * Manages player-specific local state like their display name and unique ID.
 */
const UID_SUFFIX_LENGTH = 8;

export const usePlayerStore = create<PlayerStore>((set) => ({
  name: localStorage.getItem("playerName") || "",
  playerUid: sessionStorage.getItem("player_uid") || (() => {
    const newUid = `p_${Date.now()}_${uuidv4().slice(0, UID_SUFFIX_LENGTH)}`;
    sessionStorage.setItem("player_uid", newUid);
    return newUid;
  })(),
  setName: (name: string) => {
    localStorage.setItem("playerName", name);
    set({ name });
  },
}));

// Helper exports for non-hook usage (like in registration logic)
export const getPlayerName = () => usePlayerStore.getState().name;
export const setPlayerName = (name: string) => usePlayerStore.getState().setName(name);
export const getOrCreatePlayerUid = () => usePlayerStore.getState().playerUid;

export default usePlayerStore;
