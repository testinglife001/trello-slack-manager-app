// modules/chat/ThreadPanel.jsx
// modules/chat/ThreadPanel.jsx
import { useState } from "react";
import { request } from "../../api/client";
import ThreadReplies from "./ThreadReplies";
import ThreadInput from "./ThreadInput";
import "./thread.css";

export default function ThreadPanel({ message, onClose }) {

  const [resolved, setResolved] = useState(false);

  if (!message) return null;

  const resolveThread = async () => {
    try {
      await request(`/threads/${message._id}/resolve`, {
        method: "PUT"
      });

      setResolved(true);
    } catch (err) {
      console.error("Resolve failed", err);
    }
  };

  return (
    <div className="thread-panel">

      <div className="thread-header">
        <div>
          <h4>Thread</h4>
          <div className="thread-parent">
            {message.content}
          </div>
        </div>

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {resolved && (
        <div className="thread-resolved">
          ✓ Thread resolved
        </div>
      )}

      <ThreadReplies messageId={message._id} />

      {!resolved && (
        <>
          <ThreadInput parent={message} />

          <button
            className="resolve-btn"
            onClick={resolveThread}
          >
            Mark Resolved
          </button>
        </>
      )}

    </div>
  );
}
