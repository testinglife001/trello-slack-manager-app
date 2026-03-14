// 📁 GhostCursors.jsx
export default function GhostCursors({ actors }) {
  return (
    <>
      {actors.map(a => (
        <div
          key={a.id}
          className="ghost-cursor"
          style={{ left: a.x, top: a.y }}
        >
          <img src={a.avatar} />
          <span>{a.name}</span>
        </div>
      ))}
    </>
  );
}
