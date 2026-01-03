// src/components/RoundHistory.tsx
import { Box, Text, Stack, Badge } from "@chakra-ui/react";
import type { RoundResult, RoomState } from "@/types";

interface Props {
  history: RoundResult[];
  room: RoomState;
}

export function RoundHistory({ history, room }: Props) {
  if (!history.length) return null;

  return (
    <Box borderWidth="1px" p={4} borderRadius="lg" mt={4}>
      <Text fontWeight="bold" mb={3}>
        📜 Round History
      </Text>

      <Stack gap={3}>
        {history.map((round, index) => {
          const winner = round.winnerUid
            ? room.players.find((p) => p.playerUid === round.winnerUid)
            : null;

          return (
            <Box key={index} p={3} borderWidth="1px" borderRadius="md">
              <Text fontWeight="600">Round {index + 1}</Text>

              {round.isDraw ? (
                <Badge colorScheme="yellow" mt={1}>
                  Draw
                </Badge>
              ) : (
                <Badge colorScheme="green" mt={1}>
                  Winner: {winner?.name ?? "Unknown"}
                </Badge>
              )}

              <Text fontSize="sm" mt={2} opacity={0.8}>
                {Object.entries(round.choices)
                  .map(([uid, move]) => {
                    const p = room.players.find((pl) => pl.playerUid === uid);
                    const label = p?.name || uid.slice(0, 6);
                    return `${label}: ${move}`;
                  })
                  .join(" | ")}
              </Text>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
