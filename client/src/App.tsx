import io from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";
const url = "http://localhost:3030";
const socket = io(url);

function App() {
  const [msg, setMsg] = useState({});
  const [msgr, setMsgR] = useState([]);
  const [username, setUserName] = useState("");
  const id = socket.id;
  const sendMessage = (e: any) => {
    socket.emit("send-message", {
      msg: msg.msg,
      username: username,
    });
  };

  useEffect(() => {
    socket.on("recieve-msg", (allMsg: any) => {
      setMsgR((prev) => [...prev, allMsg]);
    });
  }, [socket]);

  const inputHandlermsg = (e: any) => {
    setMsg({ id: socket.id, msg: e.target.value, name: username });
  };
  const inputHandlerName = (e: any) => {
    setUserName(e.target.value);
  };
  return (
    <>
      <input placeholder="message" type="text" onChange={inputHandlermsg} />
      <input
        placeholder="enter your name"
        type="text"
        onChange={inputHandlerName}
      />
      <button onClick={sendMessage}>send message</button>

      <>
        {msgr.map((m) => {
          console.log(m);
          return (
            <div>
              {m.username}::
              {m.msg}
            </div>
          );
        })}
      </>
    </>
  );
}

export default App;
