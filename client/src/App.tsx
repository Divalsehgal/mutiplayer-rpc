import io from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";
const url = "http://localhost:3030";
const socket = io(url);

function App() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [userState, setUserState] = useState("");

  useEffect(() => {
    // Listen for 'users-update' event from the server
    socket.on("users-update", (updatedUsers) => {
      setUsers(updatedUsers);
      const readyUsersCount = updatedUsers.filter(
        (user) => user.state === "ready"
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
  }, []);

  const inputHandlerName = (e) => {
    setUsername(e.target.value);
  };

  const registerUser = () => {
    if (username !== "") socket.emit("register", username);
  };

  console.log(users);

  return (
    <>
      <input
        placeholder="Enter your name"
        type="text"
        onChange={inputHandlerName}
      />
      current user: {username}
      <button className="register" onClick={registerUser}>
        Register
      </button>
      <div>
        <h2>User List</h2>
        <p>{userState}</p>
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              {user?.name} - {user.state}
            </li>
          ))}
        </ul>
      </div>
      <div></div>
    </>
  );
}

export default App;
