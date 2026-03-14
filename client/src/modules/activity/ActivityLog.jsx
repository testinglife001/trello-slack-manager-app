// ActivityLog.jsx

import dayjs from "dayjs";

export default function ActivityLog({ items }) {
  return (
    <div className="activity-log">
      {items.map(a => (
        <div key={a._id} className="activity-row">
          <img src={a.actor?.avatar} width="24" />
          <div>
            <b>{a.actor?.name}</b> {a.action} {a.entityType}
            <div className="meta">
              {dayjs(a.createdAt).format("MMM D, HH:mm")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
