// ✅ FIX ActivityFeeds.jsx
export default function ActivityFeeds({ activities }) {
  return (
    <div className="activity-feed">
      {activities.map(a => (
        <div key={a._id} className="activity-item">
          <strong>{a.actor?.name}</strong> {a.action} {a.entityType}
          {a.meta?.title && `: ${a.meta.title}`}
        </div>
      ))}
    </div>
  );
}
