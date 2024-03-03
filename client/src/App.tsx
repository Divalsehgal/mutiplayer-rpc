import io from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";
const url = "http://localhost:3030";
const socket = io(url);

function App() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState({});
  const [selectedOption, setSelectedOption] = useState("");
  const [playerRole, setPlayerRole] = useState(""); // Player 1 or Player 2

  useEffect(() => {
    // Listen for 'users-update' event from the server
    socket.on("users-update", (updatedUsers) => {
      setUsers(updatedUsers);
      setCurrentUser(updatedUsers[socket?.id]);
      const playingUserCount = Object.values(updatedUsers).filter(
        (user) => user?.state === "playing"
      ).length;

      if (playingUserCount === 1 && Object.values(updatedUsers).length >= 2) {
        setPlayerRole(
          updatedUsers[socket?.id]?.state === "playing" ? "Player 1" : "Player 2"
        );
      }
    });

    // Listen for result of the game
    socket.on("result", (data) => {
      // Handle the result of the game
      console.log("Winner: ", data.winner);
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

  const inputHandlerName = (e) => {
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
      (user) => user.state === "playing"
    );
    if (joingame?.state === "playing") {
      socket.emit("join-room", joingame.room);
    } else {
      socket.emit("start-game");
    }
  };

  const selectOption = (option) => {
    // Handle user's selection of rock, paper, or scissors
    setSelectedOption(option);
  };

  const submitChoice = () => {
    // Submit the user's choice to the server
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
  }

  return (
    <div className="container">
      <h3>Welcome to this Game</h3>
      {!currentUser?.id && (
        <h5>Please enter your name and register yourself</h5>
      )}
      {currentUser?.name && (
        <div className="current-player">Current user: {currentUser?.name}</div>
      )}

      {!currentUser?.id && (
        <div>
          <input
            placeholder="Enter your name"
            type="text"
            onChange={inputHandlerName}
            value={username}
          />
          <button className="register" onClick={registerUser}>
            Register
          </button>
        </div>
      )}

      {currentUser?.state === "ready" && (
        <div>
          <button onClick={startGameHandler}>Start</button>
        </div>
      )}

      {currentUser?.state === "playing" &&
        Object.values(users).filter((f) => f.state === "playing")?.length ==
          2 && (
          <div>
            <h4>{playerRole}'s Turn</h4>
            <h4>Make Your Choice:</h4>
            <button onClick={() => selectOption("Rock")}>Rock</button>
            <button onClick={() => selectOption("Paper")}>Paper</button>
            <button onClick={() => selectOption("Scissors")}>Scissors</button>
            <button onClick={submitChoice}>Submit Choice</button>
          </div>
        )}

      <div>
        <h2>User List</h2>
        <ul>
          {Object.values(users).map((user, index) => (
            <li key={index}>
              {user.name} - {user.state}
            </li>
          ))}
        </ul>
      </div>
      <div></div>
    </div>
  );
}

export default App;
