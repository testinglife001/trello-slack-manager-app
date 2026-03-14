// modules/card/CommentPanel.jsx
import { useEffect, useState, useCallback } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import dayjs from "dayjs";

export default function CommentPanel({ cardId }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  // ================= LOAD COMMENTS
  const load = useCallback(async () => {
    try {
      const data = await request(`/comments/card/${cardId}`);
      setItems(Array.isArray(data) ? data.reverse() : []);
    } catch {
      setItems([]);
    }
  }, [cardId]);

  useEffect(() => {
    load();
  }, [load]);

  // ================= REALTIME LISTENER
  useEffect(() => {
    if (!socket) return;

    const handler = (d) => {
      if (d.card !== cardId) return;
      load();
    };

    socket.on("comment-added", handler);

    return () => {
      socket.off("comment-added", handler);
    };
  }, [socket, cardId, load]);

  // ================= SEND COMMENT
  const send = async () => {
    if (!text.trim()) return;

    const newComment = await request(`/comments`, {
      method: "POST",
      body: JSON.stringify({
        card: cardId,
        content: text
      })
    });

    socket.emit("comment-new", {
      project: projectId,
      card: cardId
    });

    setText("");
    setItems(prev => [newComment, ...prev]);
  };

  // ================= CUSTOM STYLES
  const styles = {
    panel: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxHeight: "500px"
    },
    title: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#222"
    },
    inputWrapper: {
      display: "flex",
      gap: "10px",
      alignItems: "center"
    },
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      overflowY: "auto",
      paddingRight: "6px"
    },
    item: {
      background: "#f9fafb",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #ececec",
      transition: "all 0.2s ease"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "6px",
      fontSize: "13px",
      color: "#666"
    },
    author: {
      fontWeight: "600",
      color: "#111"
    },
    time: {
      fontSize: "12px",
      color: "#888"
    },
    content: {
      fontSize: "14px",
      color: "#333",
      lineHeight: "1.5"
    }
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Comments</h3>

      {/* Input FIRST */}
      <div style={styles.inputWrapper}>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment..."
        />
        <Button onClick={send}>Add</Button>
      </div>

      {/* Comment List BELOW input */}
      <div style={styles.list}>
        {items.map(c => (
          <div key={c._id} style={styles.item}>
            <div style={styles.header}>
              <b style={styles.author}>{c.author?.name || "User"}</b>
              <span style={styles.time}>
                {dayjs(c.createdAt).format("DD MMM HH:mm")}
              </span>
            </div>
            <div style={styles.content}>
              {c.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
