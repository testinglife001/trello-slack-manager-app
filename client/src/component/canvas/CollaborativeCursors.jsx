// CollaborativeCursors.jsx

import { useEffect, useState } from "react";

export default function CollaborativeCursors({ socket }) {
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    socket.on("cursor-update", (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: data
      }));
    });
  }, []);

  return (
    <>
      {Object.values(cursors).map(cursor => (
        <div
          key={cursor.userId}
          style={{
            position: "absolute",
            left: cursor.x,
            top: cursor.y,
            pointerEvents: "none",
            zIndex: 1000
          }}
        >
          <div style={{
            background: cursor.color,
            color: "white",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 10
          }}>
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  );
}
