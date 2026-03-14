// modules/chat/TypingIndicator.jsx
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import "./TypingIndicator.css";

// import { useEffect, useState } from "react";
// import { useSocket } from "../../context/SocketContext";

export default function TypingIndicator() {
  const socket = useSocket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket?.on("typing:update", setUsers);
    return () => socket?.off("typing:update");
  }, [socket]);

  if (!users.length) return null;

  return (
    <div className="typing">
      {users.join(", ")} typing...
    </div>
  );
}
