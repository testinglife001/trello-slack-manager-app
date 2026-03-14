// modules/chat/ReactionBar.jsx
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import "./ReactionBar.css";

export default function ReactionBar({ message }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const react = (emoji) => {
    socket.emit("reaction:add", {
      project: projectId,
      messageId: message._id,
      emoji
    });
  };

  return (
    <div className="reactions">
      <button onClick={() => react("👍")}>👍</button>
      <button onClick={() => react("🔥")}>🔥</button>
    </div>
  );
}


