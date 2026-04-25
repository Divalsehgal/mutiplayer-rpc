import { useEffect } from 'react';
import { socket } from '../api/socket';

export function useSocketEvent<T = any>(
  event: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    socket.on(event as any, callback as any);
    return () => {
      socket.off(event as any, callback as any);
    };
  }, [event, callback]);
}
