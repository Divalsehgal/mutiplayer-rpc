import io, { Socket } from "socket.io-client";
import "./global.css";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

const url = "http://localhost:3030";
const socket: Socket = io(url);

type UserObject = {
  [key: string]: User;
};
export interface User {
  id: string;
  name: string;
  state: string;
  room?: string;
}
const initialUser: User = {
  id: "",
  name: "",
  state: "",
  room: "",
};

const initialUserObj: UserObject = {};

type Option = "Rock" | "Paper" | "Scissor" | "";
type Player = "Player 1" | "Player 2";

function App() {
  const [username, setUsername] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [users, setUsers] = useState<UserObject>(initialUserObj);
  const [selectedOption, setSelectedOption] = useState<Option>("");
  const [playerRole, setPlayerRole] = useState<Player>("Player 1");
  const [winner, setWinner] = useState<string>("");
  useEffect(() => {
    // Listen for 'users-update' event from the server
    socket.on("users-update", (updatedUsers: UserObject) => {
      setUsers(updatedUsers);
      socket?.id && setCurrentUser(updatedUsers[socket.id]);
      const playingUserCount = Object.values(updatedUsers).filter(
        (user: User) => user?.state === "playing"
      ).length;

      if (playingUserCount === 1 && Object.values(updatedUsers).length >= 2) {
        setPlayerRole(
          socket?.id && updatedUsers[socket.id]?.state === "playing"
            ? "Player 1"
            : "Player 2"
        );
      }
    });

    // Listen for result of the game
    socket.on("result", (data) => {
      setWinner(data.winner);
      // Handle the result of the game
      // Here you can update UI or do any additional logic based on the game result
    });

    // Listen for game-started event
    socket.on("game-started", () => {});

    return () => {
      socket.off("users-update");
      socket.off("result");
      socket.off("game-started");
    };
  }, [socket]);

  const inputHandlerName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const registerUser = () => {
    if (username !== "") {
      socket.emit("register", username);
      setUsername("");
    }
  };

  const startGameHandler = () => {
    // Handle starting the game
    let joingame = Object.values(users).find(
      (user: User) => user.state === "playing"
    );
    if (joingame?.state === "playing") {
      socket.emit("join-room", joingame.room);
    } else {
      socket.emit("start-game");
    }
  };

  const selectOption = (option: Option) => {
    setSelectedOption(option);
  };

  const submitChoice = () => {
    if (currentUser.state === "playing") {
      if (selectedOption !== "") {
        const choiceEndpoint =
          playerRole === "Player 1" ? "p1Choice" : "p2Choice";
        socket.emit(choiceEndpoint, {
          rpsValue: selectedOption,
          roomUniqueId: currentUser.room,
        });
        setSelectedOption("");
      } else {
        alert("Please select an option (Rock, Paper, or Scissors)");
      }
    }
  };

  return (
    <div className="w-full flex flex-col bg-primary-light text-primary-light  h-screen justify-center  items-center">
      <h1 className="text-center absolute top-10 text-3xl">
        Welcome to RPC Game
      </h1>
      <div className="flex gap-2">
        {winner && <h1 className="text-2xl">Result&nbsp;:&nbsp;{winner}</h1>}
      </div>

      <div className="flex justify-center items-center flex-row absolute left-10 top-10">
        {currentUser?.name && (
          <Label className="current-player">
            Current user: {currentUser?.name}
          </Label>
        )}
      </div>

      {!currentUser?.id && (
        <div className="border-2 p-10 border-primary-light flex flex-col gap-2 mt-10">
          {!currentUser?.id && (
            <h5>Please enter your name and register yourself</h5>
          )}
          <Input
            placeholder="Enter your name"
            type="text"
            onChange={inputHandlerName}
            value={username}
          />
          <Button variant="outline" className="register" onClick={registerUser}>
            Register
          </Button>
        </div>
      )}

      {currentUser?.state === "ready" && (
        <div>
          <Button variant="outline" onClick={startGameHandler}>
            Start
          </Button>
        </div>
      )}

      {currentUser?.state === "playing" &&
        winner === "" &&
        Object.values(users).filter((f: User) => f.state === "playing")
          ?.length == 2 && (
          <div className="flex gap-2 flex-col border-2 p-6  border-slate-500">
            <h4>{playerRole}'s Turn</h4>
            <h4>Make Your Choice:</h4>
            <div className="flex gap-2">
              <Button
                className={`${
                  selectedOption === "Rock" ? "text-slate-500 " : ""
                }`}
                onClick={() => selectOption("Rock")}
              >
                Rock
              </Button>
              <Button
                className={`${
                  selectedOption === "Paper" ? "text-slate-500" : ""
                }`}
                onClick={() => selectOption("Paper")}
              >
                Paper
              </Button>
              <Button
                className={`${
                  selectedOption === "Scissor" ? "text-slate-500" : ""
                }`}
                onClick={() => selectOption("Scissor")}
              >
                Scissors
              </Button>
              <Button disabled={!selectedOption} onClick={submitChoice}>
                Submit Choice
              </Button>
            </div>
          </div>
        )}

      {Object.values(users).length > 0 && (
        <div className=" border-2 p-10 absolute  right-10 top-10 border-primary-light flex flex-col gap-2 ">
          <ul>
            <h2>User List</h2>
            {Object.values(users).map((user: User, index: number) => (
              <li key={index}>
                {user.name} - {user.state}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
