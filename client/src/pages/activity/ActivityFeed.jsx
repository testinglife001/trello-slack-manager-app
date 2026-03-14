// 1️⃣ ActivityFeed.jsx (Rewritten Controlled Component)
export default function ActivityFeed({ activities }) {
  return (
    <div className="activity-feed">
      {activities.map(a => (
        <div key={a._id} className="activity-item">
          <strong>{a.actor?.name}</strong>{" "}
          {a.action} <em>{a.entityType}</em>
          {a.meta?.title && `: ${a.meta.title}`}
          <div className="activity-time">
            {new Date(a.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
