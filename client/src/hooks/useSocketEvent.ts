import { useEffect } from 'react';
import { socket } from '../api/socket';
import { ServerToClientEvents } from '../types/events';

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  callback: ServerToClientEvents[K]
) {
  useEffect(() => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
}
