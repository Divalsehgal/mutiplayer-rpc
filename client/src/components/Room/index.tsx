import type { RoomState, Player, Spectator } from "@/types";
import { Players } from "../Players";
import { Spectators } from "../Spectators";

interface RoomProps {
  room: RoomState;
  roomId: string;
}

const Room = ({ room }: Omit<RoomProps, "roomId">) => {
  const players = room.players.filter((p): p is Player => p.role === "player");
  const spectators = room.players.filter(
    (p): p is Spectator => p.role === "spectator"
  );

  return (
    <div className="flex flex-col gap-6">
      <Players players={players} />
      <Spectators spectators={spectators} />
    </div>
  );
};

export { Room };
