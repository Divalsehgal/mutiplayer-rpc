import { useEffect } from 'react';
import { socket } from '../api/socket';
import { ServerToClientEvents } from '../types/events';

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  callback: (...args: unknown[]) => void
) {
  useEffect(() => {
    // Using a narrow cast with an eslint-disable to avoid noisy socket generic mismatches
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (socket as any).on(event, callback);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket as any).off(event, callback);
    };
  }, [event, callback]);
}
