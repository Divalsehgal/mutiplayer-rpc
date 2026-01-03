import { Badge, HStack, Stack, Text } from "@chakra-ui/react";

export const Spectators = ({
  spectators,
}: {
  spectators: { playerUid: string; name: string }[];
}) => {
  return (
    <Stack>
      <Text fontWeight={600}>Spectators</Text>
      {spectators.length === 0 && <Text color="gray.500">No spectators</Text>}
      {spectators.map((s) => (
        <HStack key={s.playerUid} gap={3}>
          <Badge variant="subtle" colorScheme="gray">
            👁 Spectator
          </Badge>
          <Text>{s.name}</Text>
        </HStack>
      ))}
    </Stack>
  );
};

