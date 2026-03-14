// MentionHighlights.jsx
const MentionHighlights = ({ mentions }) => {
  return (
    <>
      {mentions.map((m, i) => {
        const node = m.op?.payload?.nodeId;
        const style = {
          position: "absolute",
          left: m.op?.payload?.x || 0,
          top: m.op?.payload?.y || 0,
          width: 80,
          height: 80,
          border: "3px solid #ffca28",
          borderRadius: "8px",
          pointerEvents: "none",
          animation: "highlight-fade 1s ease-out"
        };
        return <div key={i} style={style}></div>;
      })}
      <style>{`
        @keyframes highlight-fade {
          0% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default MentionHighlights;