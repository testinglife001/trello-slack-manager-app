// FilePreviewModal.jsx

export default function FilePreviewModal({ file, open, onClose }) {
  if (!open || !file) return null;

  const url = URL.createObjectURL(file);

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        <h3>Preview</h3>

        {file.type.startsWith("image/") && (
          <img src={url} style={{ maxWidth: "100%" }} />
        )}

        {file.type.startsWith("video/") && (
          <video src={url} controls style={{ width: "100%" }} />
        )}

        {!file.type.startsWith("image/") &&
         !file.type.startsWith("video/") && (
          <p>📄 {file.name}</p>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
