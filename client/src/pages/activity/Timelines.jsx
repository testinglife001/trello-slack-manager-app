// ✅ FIX Timelines.jsx
export default function Timelines({ versions, onSelect }) {
  return (
    <div className="timeline">
      {versions.map(v => (
        <div key={v._id} onClick={() => onSelect(v.version)}>
          v{v.version}
        </div>
      ))}
    </div>
  );
}
