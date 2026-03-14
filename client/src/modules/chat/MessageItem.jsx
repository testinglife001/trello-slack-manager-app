// modules/chat/MessageItem.jsx
// modules/chat/MessageItem.jsx
import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import MessageHoverBar from "./MessageHoverBar";
import ReactionPicker from "./ReactionPicker";
import ReactionBar from "./ReactionBar";
import ReadReceipt from "./ReadReceipt";

export default function MessageItem({ message, openThread }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [hover, setHover] = useState(false);
  const [picker, setPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(message.content);

  const save = () => {
    if (!socket) return;
    socket.emit("message:edit", {
      project: projectId,
      messageId: message._id,
      content: value,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!socket) return;
    socket.emit("message:delete", {
      project: projectId,
      messageId: message._id,
    });
  };

  const handleReact = (emoji) => {
    if (!socket) return;
    socket.emit("reaction:add", {
      project: projectId,
      messageId: message._id,
      emoji,
    });
    setPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div
      className="msg-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPicker(false);
      }}
    >
      {editing ? (
        <div className="edit-box">
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={save}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="msg-content">
          {message.content}
        </div>
      )}

      {hover && !editing && (
        <MessageHoverBar
          onReact={() => setPicker(v => !v)}
          onReply={() => openThread?.(message)}
          onEdit={() => setEditing(true)}
          onDelete={handleDelete}
        />
      )}

      {picker && (
        <ReactionPicker onSelect={handleReact} />
      )}

      <ReactionBar message={message} />
      <ReadReceipt message={message} />
    </div>
  );
}







/*
// modules/chat/MessageItem.jsx (REWRITE)
import { useState } from "react";
import MessageHoverBar from "./MessageHoverBar";
import ReactionPicker from "./ReactionPicker";
import ReactionBar from "./ReactionBar";
import ReadReceipt from "./ReadReceipt";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";

export default function MessageItem({ message, openThread }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [hover, setHover] = useState(false);
  const [picker, setPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(message.content);

  const save = () => {
    socket.emit("message:edit", {
      project: projectId,
      messageId: message._id,
      content: value
    });
    setEditing(false);
  };

  return (
    <div
      className="msg-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      
      {editing ? (
        <div className="edit-box">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <button onClick={save}>Save</button>
        </div>
      ) : (
        <div
          className="msg-content"
          onClick={() => openThread?.(message)}
        >
          {message.content}
        </div>
      )}

      {hover && (
        <MessageHoverBar
          onReact={() => setPicker(v => !v)}
          onReply={() => openThread?.(message)}
          onEdit={() => setEditing(true)}
          onDelete={() =>
            socket.emit("message:delete", {
              project: projectId,
              messageId: message._id
            })
          }
        />
      )}

      {picker && (
        <ReactionPicker
          onSelect={(emoji) => {
            socket.emit("reaction:add", {
              project: projectId,
              messageId: message._id,
              emoji
            });
            setPicker(false);
          }}
        />
      )}

      <ReactionBar message={message} />
      <ReadReceipt message={message} />
    </div>
  );
}
*/



/*
import ReactionBar from "./ReactionBar";
import ReadReceipt from "./ReadReceipt";

export default function MessageItem({ message, openThread }) {
  return (
    <div className="msg-item">
      <div
        className="msg-content"
        onClick={() => openThread?.(message)}
      >
        {message.content}
      </div>

      <div className="msg-meta">
        {message.threadCount > 0 && (
          <span className="thread-count">
            {message.threadCount} replies
          </span>
        )}
      </div>

      <ReactionBar message={message} />
      <ReadReceipt message={message} />
    </div>
  );
}
*/
