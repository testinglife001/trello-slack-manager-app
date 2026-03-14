// LiveCursors.jsx
const LiveCursors = ({ actors }) => {
  return (
    <div className="live-cursors">
      {actors.map(actor => (
        <div
          key={actor.id}
          style={{
            position: "absolute",
            left: actor.x || 0,
            top: actor.y || 0,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: actor.color || "#4caf50",
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            transition: "all 0.05s linear"
          }}
          title={actor.name}
        ></div>
      ))}
    </div>
  );
};

export default LiveCursors;