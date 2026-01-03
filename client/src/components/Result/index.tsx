import { RoundResult, RoomState } from "@/types";
import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import { getOrCreatePlayerUid } from "@/store/playerStore";

export const Result = ({
  lastResult,
  room,
}: {
  lastResult: RoundResult;
  room: RoomState;
}) => {
  if (!lastResult) return null;

  const myUid = getOrCreatePlayerUid();
  const players = room.players || [];

  const getName = (uid: string) => {
    const p = players.find((x) => x.playerUid === uid);
    return p?.name || uid.slice(0, 4);
  };

  const winnerName = lastResult.winnerUid
    ? getName(lastResult.winnerUid)
    : null;
  const iWon = lastResult.winnerUid === myUid;

  return (
    <Box
      p="4"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="gray.800"
      color="white"
      mt={4}
    >
      {lastResult.isDraw ? (
        <Text
          fontSize="xl"
          fontWeight="700"
          textAlign="center"
          color="yellow.300"
        >
          🤝 It's a Draw!
        </Text>
      ) : iWon ? (
        <Text
          fontSize="xl"
          fontWeight="700"
          textAlign="center"
          color="green.400"
        >
          🥳 You Won! — {winnerName}
        </Text>
      ) : (
        <Text fontSize="xl" fontWeight="700" textAlign="center" color="red.300">
          ❌ You Lost! Winner: {winnerName}
        </Text>
      )}

      <VStack spacing={2} mt={4}>
        {Object.entries(lastResult.choices).map(([uid, choice]) => (
          <HStack
            key={uid}
            justify="space-between"
            w="100%"
            bg={uid === myUid ? "whiteAlpha.200" : "whiteAlpha.100"}
            p={2}
            borderRadius="md"
          >
            <Text fontWeight={uid === myUid ? "bold" : "normal"}>
              {uid === myUid ? "🟢 You" : getName(uid)}
            </Text>
            <Badge colorScheme="blue" variant="solid">
              {choice}
            </Badge>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};
