export default function NotificationsPanel({ mentions = [] }) {
  if (!mentions.length) {
    return <p className="empty-state">No mentions yet.</p>;
  }

  return (
    <div className="notifications-panel">
      {mentions.map((m, i) => (
        <div key={m._id || `${m.createdAt || i}-${i}`} className="mention-item">
          <strong>{m.actor?.name || "Someone"}</strong> mentioned you
          <div className="mention-time">
            {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
