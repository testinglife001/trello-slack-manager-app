// modules/canvas/CursorLayer.jsx
export default function CursorLayer({ users }) {
  return (
    <>
      {users.map(u => (
        <div
          key={u.user.id}
          className="cursor"
          style={{ left: u.x, top: u.y }}
        >
          {u.user.name}
        </div>
      ))}
    </>
  );
}
