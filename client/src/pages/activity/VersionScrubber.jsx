// 3️⃣ VersionScrubber.jsx (Upgraded)
export default function VersionScrubber({
  versions,
  onSelect,
  selectedVersion
}) {
  return (
    <div className="version-scrubber">
      {versions.map(v => (
        <div
          key={v._id}
          className={`version-thumb ${
            selectedVersion?._id === v._id ? "active" : ""
          }`}
          style={{
            backgroundImage: `url(${v.thumbnail || "/placeholder.png"})`
          }}
          onClick={() => onSelect(v)}
        >
          <span className="version-label">v{v.version}</span>
        </div>
      ))}
    </div>
  );
}
