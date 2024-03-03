import io from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";
const url = "http://localhost:3030";
const socket = io(url);

function App() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState({});
  const [userState, setUserState] = useState("");

  useEffect(() => {
    // Listen for 'users-update' event from the server
    socket.on("users-update", (updatedUsers) => {
      setUsers(updatedUsers);
      setCurrentUser(updatedUsers[socket.id]);
      const readyUsersCount = Object.keys(updatedUsers).filter(
        (userId) => updatedUsers[userId].state === "ready"
      ).length;
      if (readyUsersCount === 2) {
        setUserState("Both users are ready");
      } else {
        setUserState("Waiting for more users to join");
      }
    });

    return () => {
      socket.off("users-update");
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
    let joingame = Object.values(users).find((user) => user.state === "playing")
    if (joingame?.state === "playing") {
      socket.emit("join-room", joingame.room);
    } else {
      socket.emit("start-game");
    }
  };


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
