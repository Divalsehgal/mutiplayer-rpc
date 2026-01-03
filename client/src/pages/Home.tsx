import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Heading, Stack, Text, Input } from "@chakra-ui/react";
import { socket } from "@/api/socket";
import {
  getOrCreatePlayerUid,
  setPlayerName,
  getPlayerName,
} from "@/store/playerStore";

const Home = () => {
  const [name, setName] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomToJoin, setRoomToJoin] = useState("");

  const navigate = useNavigate();

  const registerUser = (cb: () => void) => {
    // If the stored name differs from the current name, regenerate a fresh playerUid
    try {
      const prev = getPlayerName() || "";
      if (prev !== name) {
        sessionStorage.removeItem("playerUid");
      }
    } catch (e) {
      // ignore storage errors
    }

    const playerUid = getOrCreatePlayerUid();
    if (!socket.connected) socket.connect();

    socket.emit("register", { playerUid, name }, (res: any) => {
      if (!res.ok) console.error("Registration failed:", res);
      // persist the name after successful (or attempted) registration
      try {
        setPlayerName(name);
      } catch (e) {
        // ignore
      }
      cb();
    });
  };

  const createRoom = () => {
    if (!name.trim()) return;
    registerUser(() => {
      socket.emit("create-room", { gameType: "RPS" }, (res: any) => {
        if (res.ok && res.roomId) navigate(`/room/${res.roomId}`);
      });
    });
  };

  const joinRoom = (roomId?: string) => {
    const id = roomId ?? roomToJoin;
    if (!id?.trim()) return;

    registerUser(() => navigate(`/room/${id.trim()}`));
  };

  return (
    <Box
      maxW="420px"
      mx="auto"
      mt="80px"
      px={6}
      py={8}
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="lg"
      bg="bg.surface"
    >
      <Stack gap={6}>
        <Heading size="lg" textAlign="center">
          🎮 Multiplayer Lobby
        </Heading>
        <Text textAlign="center" color="fg.muted">
          Enter your name to create or join a room
        </Text>
        <form>
          <div>Your Name</div>
          <Input
            placeholder="John, Priya..."
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </form>

        {!showJoinInput && (
          <Button
            onClick={() => {
              setPlayerName(name);
              createRoom();
            }}
            disabled={Boolean(name.trim() === "")}
          >
            Create Room
          </Button>
        )}

        {!showJoinInput ? (
          <Button
            variant="outline"
            onClick={() => {
              setPlayerName(name);
              setShowJoinInput(true);
            }}
            disabled={!name.trim()}
          >
            Join Room
          </Button>
        ) : (
          <Stack>
            <Input
              placeholder="Enter room ID"
              value={roomToJoin}
              onChange={(e) => setRoomToJoin(e.target.value)}
            />
            <Stack>
              <Button
                colorScheme="blue"
                onClick={() => {
                  setPlayerName(name);
                  joinRoom(roomToJoin);
                }}
              >
                Join
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowJoinInput(false);
                  setRoomToJoin("");
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default Home;
