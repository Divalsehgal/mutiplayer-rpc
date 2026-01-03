import { Player } from "@/types";
import { Badge, HStack, Stack, Text } from "@chakra-ui/react";

export const Players = ({ players }: { players: Player[] }) => {
  return (
    <Stack>
      <Text fontWeight={600}>Players</Text>
      {players.length === 0 && (
        <Text color="gray.500">No active players yet</Text>
      )}
      {players.map((p: Player) => (
        <HStack key={p.playerUid} gap={3}>
          <Badge colorScheme="green">🎮 Player</Badge>
          <Text>{p.name}</Text>
          <Badge colorScheme={p.state === "connected" ? "green" : "red"}>
            {p.state}
          </Badge>
        </HStack>
      ))}
    </Stack>
  );
};
