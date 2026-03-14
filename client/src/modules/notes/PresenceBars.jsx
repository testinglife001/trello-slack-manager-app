// 📁 modules/notes/PresenceBars.jsx


import "./presence.css";

export default function PresenceBars({ presence }) {
  const users = Object.values(presence || {});

  if (!users.length) return null;

  return (
    <div className="presence-bar">
      {users.map(u => (
        <div key={u.id} className="presence-user">
          <img src={u.avatar} />
          <span>{u.name}</span>
        </div>
      ))}
    </div>
  );
}
