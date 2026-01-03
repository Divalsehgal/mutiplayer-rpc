import { Player, RoomState, RoundResult } from "@/types";
import { Badge, HStack, Stack, Text } from "@chakra-ui/react";

export const Scoreboard = ({
  players,
  myUid,
  lastResult,
  room,
}: {
  players: Player[];
  myUid: string | undefined;
  lastResult: RoundResult | null;
  room: RoomState;
}) => {
  return (
    <Stack gap="2">
      <Text fontWeight={600}>Scores</Text>

      {players
        .filter((p) => p.playerUid === myUid)
        .map((p) => (
          <HStack key={p.playerUid} gap="2">
            <Badge>{p.name}</Badge>

            <Text>
              {lastResult?.scores?.[p.playerUid] ??
                room.gameState?.scores?.[p.playerUid] ??
                0}
            </Text>
          </HStack>
        ))}
    </Stack>
  );
};
