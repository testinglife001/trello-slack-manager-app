// ProjectActivityFeed.jsx

import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import ActivityFeed from "./ActivityFeed";

export default function ProjectActivityFeed({ projectId }) {
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);

  const load = async (nextCursor = null) => {
    const url = nextCursor
      ? `/activity/project/${projectId}?cursor=${nextCursor}`
      : `/activity/project/${projectId}`;

    const data = await request(url);

    if (!nextCursor) {
      setItems(data);
    } else {
      setItems(prev => [...prev, ...data]);
    }

    if (data.length)
      setCursor(data[data.length - 1].createdAt);
  };

  useEffect(() => { load(); }, [projectId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("activity:new", (activity) => {
      if (activity.project === projectId) {
        setItems(prev => [activity, ...prev]);
      }
    });

    return () => socket.off("activity:new");
  }, [socket, projectId]);

  return (
    <div>
      <ActivityFeed items={items} />
      <button onClick={() => load(cursor)}>
        Load More
      </button>
    </div>
  );
}
