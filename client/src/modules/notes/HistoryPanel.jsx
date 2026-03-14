// 🧩 4) History Panel
// Uses backend history array.

import { useEffect, useState } from "react";
import { request } from "../../api/client";
// import { request } from "../../services/api";

export default function HistoryPanel({ noteId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      const n = await request(`/notes/${noteId}`);
      setHistory(n.history || []);
    };
    load();
  }, [noteId]);

  if (!history.length) return null;

  return (
    <div className="history">
      <h4>History</h4>
      {history.map((h, i) => (
        <div key={i}>
          {new Date(h.editedAt).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
