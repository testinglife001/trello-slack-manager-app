// 🧩 3) Presence Bar
// Shows who is editing.

export default function PresenceBar({ users }) {
  if (!users?.length) return null;

  return (
    <div className="presence">
      {users.map(u => (
        <div key={u._id} className="presence-user">
          {u.name}
        </div>
      ))}
    </div>
  );
}
