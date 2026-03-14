// modules/chat/MessageInput.jsx
// modules/chat/MessageInput.jsx (upgrade)
// modules/chat/MessageInput.jsx
import { useState } from "react";
import { request } from "../../services/api";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function MessageInput() {
  const [text, setText] = useState("");
  const { channelId } = useParams();
  const socket = useSocket();
  const { projectId } = useProject();


  const typing = () => {
    socket?.emit("typing:start", { project: projectId, channel: channelId });
  };

  const send = () => {
    if (!text.trim()) return;

    socket.emit("message:send", {
      project: projectId,
      channel: channelId,
      content: text
    });

    setText("");
  };


  return (
    <div className="message-input">
      <Button>😊</Button> 
      <Input
        value={text}
        onChange={e => {
          setText(e.target.value);
          typing();
        }}
        placeholder="Message..."
      />
      <Button>📎</Button>
      <Button onClick={send} className="send" >Send</Button>
    </div>
  );
}

