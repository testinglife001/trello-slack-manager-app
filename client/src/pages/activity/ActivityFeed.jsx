export default function ActivityFeed({ activities = [] }) {
  if (!activities.length) {
    return <p className="empty-state">No activity available yet.</p>;
  }

  return (
    <div className="activity-feed">
      {activities.map((a) => (
        <div key={a._id} className="activity-item">
          <strong>{a.actor?.name || "Someone"}</strong>{" "}
          {a.action || a.type || "updated"} {a.entityType ? <em>{a.entityType}</em> : null}
          {a.meta?.title && `: ${a.meta.title}`}
          <div className="activity-time">
            {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
