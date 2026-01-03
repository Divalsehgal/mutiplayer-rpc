import { useParams } from "react-router-dom";
import { socket } from "@/api/socket";
import { useRoom } from "@/hooks/useRoom";

import {
  Stack,
  Box,
  Text,
  HStack,
  Button,
  Badge,
  Grid,
  GridItem,
} from "@chakra-ui/react";

import { typedSocket } from "@/api/typedSocket";
import { Loader } from "@/components/Loader";
import { Room as RoomLobby } from "@/components/Room";
import { Board } from "@/components/Board";
import { RoundHistory } from "@/components/RoundHistory/Index";

export default function Room(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, roundResult, history, loading, requestPlayerSlot } =
    useRoom(roomId);

  if (loading || !room) return <Loader />;

  return (
    <>
      <Box maxW="1000px" mx="auto" w="100%" px={4} py={6}>
        {/* HEADER */}
        <HStack justify="space-between" mb={6}>
          <HStack gap={2} align="center">
            <Text fontWeight={600}>Game:</Text>
            <Badge colorScheme="blue">{room.gameType}</Badge>
          </HStack>

          <Button
            size="sm"
            colorScheme="red"
            onClick={() => {
              typedSocket.emit("leave-room", {}, () => {
                window.location.href = "/";
              });
            }}
          >
            Leave
          </Button>
        </HStack>

        {/* GRID LAYOUT */}
        <Grid templateColumns="8fr 4fr" gap={6}>
          {/* LEFT - 3 columns (empty now but can be used later) */}

          {/* CENTER - 5 columns */}
          <GridItem>
            <Stack gap={6}>
              <RoomLobby
                room={room}
                roomId={roomId!}
                onRequestSlot={requestPlayerSlot}
              />

              {room.gameType === "RPS" && (
                <Board
                  room={room}
                  roomId={roomId!}
                  socket={socket}
                  lastResult={roundResult}
                />
              )}
            </Stack>
          </GridItem>

          {/* RIGHT - 4 columns (history sidebar) */}
          <GridItem>
            {room.gameType === "RPS" && history.length > 0 && (
              <Box
                borderWidth="1px"
                borderRadius="md"
                p={3}
                bg="blackAlpha.600"
                color="white"
                maxH="80vh"
                overflowY="auto"
              >
                <Text fontWeight="700" mb={3} fontSize="lg">
                  📜 Match History
                </Text>
                <RoundHistory history={history} room={room} />
              </Box>
            )}
          </GridItem>
        </Grid>
      </Box>
    </>
  );
}
