// PresenceLayer.jsx
import './PresenceLayer.css';

export default function PresenceLayer({ users }) {
  return (
    <div className="presence-layer">
      {users.map(u => (
        <div
          key={u.id}
          className="cursor"
          style={{
            left: u.cursor.x,
            top: u.cursor.y
          }}
        >
          {u.name}
        </div>
      ))}
    </div>
  );
}
