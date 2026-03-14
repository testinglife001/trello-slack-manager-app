// 4️⃣ NotificationsPanel.jsx (NEW)
export default function NotificationsPanel({ mentions }) {
  return (
    <div className="notifications-panel">
      <h3>Mentions</h3>
      {mentions.length === 0 && <p>No mentions</p>}
      {mentions.map((m, i) => (
        <div key={i} className="mention-item">
          <strong>{m.actor?.name}</strong> mentioned you
          <div className="mention-time">
            {new Date(m.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
