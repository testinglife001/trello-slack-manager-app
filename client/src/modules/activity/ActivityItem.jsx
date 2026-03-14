// modules/activity/ActivityItem.jsx
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import "./activity.css";

export default function ActivityItem({ item }) {
  const navigate = useNavigate();

  const jump = () => {
    if (!item.entity) return;

    if (item.entity === "card")
      navigate(`/cards/${item.entityId}`);

    if (item.entity === "channel")
      navigate(`/channels/${item.entityId}`);
  };

  return (
    <div className="activity-item" onClick={jump}>
      <div className="activity-line">
        <b>{item.actor?.name || "Someone"}</b>
        <span className="activity-type">{item.type}</span>
      </div>

      <div className="activity-time">
        {dayjs(item.createdAt).fromNow()}
      </div>
    </div>
  );
}
