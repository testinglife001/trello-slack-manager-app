// modules/activity/ActivityTimelines.jsx

import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import dayjs from "dayjs";

export default function ActivityTimelines({ projectId }) {
  const socket = useSocket();
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await request(
      `/activity/project/${projectId}`
    );
    setItems(data);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("activity:new", (activity) => {
      setItems((prev) => [activity, ...prev]);
    });

    return () =>
      socket.off("activity:new");
  }, [socket]);

  const groupByDate = (list) => {
    const grouped = {};
    list.forEach((i) => {
      const key = dayjs(i.createdAt).format("YYYY-MM-DD");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(i);
    });
    return grouped;
  };

  const grouped = groupByDate(items);

  return (
    <div className="activity-timeline">
      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date}>
          <h4>{dayjs(date).format("MMM D, YYYY")}</h4>

          {acts.map((a) => (
            <div key={a._id} className="activity-item">
              <img
                src={a.actor?.avatar}
                alt=""
                width="24"
              />
              <span>
                <b>{a.actor?.name}</b> {a.type}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
