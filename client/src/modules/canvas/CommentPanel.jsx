// 📁 modules/canvas/CommentPanel.jsx
// CommentPanel.jsx

import { useState } from "react";
import { useProject } from "../../context/ProjectContext";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../api/client";

export default function CommentPanel({
  nodeId,
  channelId,
  comments,
  close
}) {
  const socket = useSocket();
  const { projectId } = useProject();
  const [text, setText] = useState("");

  const list = comments.filter(c => c.nodeId === nodeId);

  const send = async () => {
    if (!text.trim()) return;

    const c = await request(`/canvas-comments`, {
      method:"POST",
      body:JSON.stringify({
        project:projectId,
        channel:channelId,
        nodeId,
        content:text
      })
    });

    socket.emit("comment:add", c);
    setText("");
  };

  return (
    <div className="comment-dock">
      <div className="comment-header">
        Comments
        <button onClick={close}>✕</button>
      </div>

      <div className="comment-list">
        {list.map(c => (
          <div key={c._id} className="comment-item">
            <b>{c.author?.name}</b>
            <div>{c.content}</div>
          </div>
        ))}
      </div>

      <div className="comment-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}





/*
import { useState } from "react";

export default function CommentPanel({
  nodeId,
  channelId,
  comments,
  visible,
  close
}) {
  const [text, setText] = useState("");
  if (!visible) return null;

  const list = comments.filter(c => c.nodeId === nodeId);

  return (
    <div className="comment-dock">
      <div className="comment-header">
        Comments
        <button onClick={close}>Hide</button>
      </div>

      <div className="comment-list">
        {list.map(c => (
          <div key={c._id}>
            <b>{c.author?.name}</b>
            <div>{c.content}</div>
          </div>
        ))}
      </div>

      <div className="comment-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Reply"
        />
      </div>
    </div>
  );
}
*/

