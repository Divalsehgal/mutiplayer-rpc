import { Box, Stack } from "@chakra-ui/react";
import type { RoomState, Player, Spectator } from "@/types";
import { Players } from "../Players";
import { Spectators } from "../Spectators";
import { RoomHeader } from "./Header";

interface RoomProps {
  room: RoomState;
  roomId: string;
  onRequestSlot: () => void;
}

const Room = ({ room, roomId, onRequestSlot }: RoomProps) => {
  const players = room.players.filter((p): p is Player => p.role === "player");
  const spectators = room.players.filter(
    (p): p is Spectator => p.role === "spectator"
  );

  return (
    <Box boxShadow="md" borderRadius="md" p={4} borderWidth="1px">
      <RoomHeader roomId={roomId} />
      <Stack gap={4}>
        <Players players={players} />
        <Spectators spectators={spectators} />
      </Stack>
    </Box>
  );
};

export { Room };
