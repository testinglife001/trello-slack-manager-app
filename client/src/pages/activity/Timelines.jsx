export default function Timelines({ versions = [], onSelect, selectedVersion }) {
  if (!versions.length) {
    return <p className="empty-state">No timeline versions yet.</p>;
  }

  return (
    <div className="timeline">
      {versions.map((v) => (
        <button
          type="button"
          key={v._id}
          className={`timeline-item ${selectedVersion?._id === v._id ? "active" : ""}`}
          onClick={() => onSelect(v)}
        >
          v{v.version}
        </button>
      ))}
    </div>
  );
}
