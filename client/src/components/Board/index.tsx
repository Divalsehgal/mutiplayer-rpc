import { getOrCreatePlayerUid } from "@/store/playerStore";
import { Box, Button, HStack, Text, Stack } from "@chakra-ui/react";
import { Socket } from "socket.io-client";
import type { RoomState, RoundResult } from "@/types";
import { useState, useEffect } from "react";
import { Scoreboard } from "../Scoreboard";
import { Result as RoundResultDisplay } from "../Result";

const CHOICES = ["Rock", "Paper", "Scissor"] as const;

interface BoardProps {
  roomId: string;
  room: RoomState;
  socket: Socket;
  lastResult: RoundResult | null;
}

export const SpectatorNotice = () => (
  <Text color="gray.400" fontSize="sm" mt="md">
    You are spectating. Join a player slot to play.
  </Text>
);

export function Board({
  roomId,
  room,
  socket,
  lastResult,
}: BoardProps): JSX.Element {
  const players = room.players.filter((p) => p.role === "player");

  const [choice, setChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const myUid = getOrCreatePlayerUid() as string | undefined;

  const me = room.players.find((p) => p.playerUid === myUid);

  const isSpectator = me?.role !== "player";
  const showChoices = room.status === "playing" && !isSpectator;
  const sendMove = (selected: (typeof CHOICES)[number]): void => {
    // clear previous selection briefly, then apply new selection
    setChoice(null);
    if (isSpectator) return;
    socket.emit("game-move", { roomId, move: selected });
    setChoice(selected);
    setSubmitted(true);
  };

  // Reset the local choice when a round result appears or after it disappears.
  useEffect(() => {
    // When a result comes in, clear the selection after a short delay so
    // the UI shows the submitted selection briefly, then resets for the next round.
    if (lastResult) {
      const t = setTimeout(() => {
        setChoice(null);
        setSubmitted(false);
      }, 500);
      return () => clearTimeout(t);
    }

    // If lastResult is null (result cleared), ensure choice/submitted are cleared immediately.
    setChoice(null);
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult]);

  // Also clear choice/submitted when a new round starts (server-driven via gameState.updatedAt or similar)
  useEffect(() => {
    setChoice(null);
    setSubmitted(false);
  }, [room.updatedAt, room.gameState?.roundId]);

  return (
    <Box boxShadow="md" p="6" borderRadius="md" borderWidth="1px">
      <Stack gap="6">
        <Scoreboard
          players={players}
          myUid={myUid}
          lastResult={lastResult}
          room={room}
        />

        {showChoices && (
          <HStack mt="md">
            {CHOICES.map((c) => (
              <Button
                key={c}
                onClick={() => sendMove(c)}
                disabled={isSpectator || submitted}
                colorScheme={choice === c ? "blue" : undefined}
              >
                {c}
              </Button>
            ))}
            {choice && <Text>Current Choice: {choice}</Text>}
          </HStack>
        )}

        {lastResult && (
          <RoundResultDisplay lastResult={lastResult} room={room} />
        )}

        {isSpectator && <SpectatorNotice />}
      </Stack>
    </Box>
  );
}
