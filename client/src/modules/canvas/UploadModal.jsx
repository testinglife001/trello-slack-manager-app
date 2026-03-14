// UploadModal.jsx
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function UploadModal({ open, onClose, onInsert }) {
  const inputRef = useRef();
  const [files, setFiles] = useState([]);

  if (!open) return null;

  const pick = () => inputRef.current?.click();

  return createPortal(
    <div className="upload-modal-backdrop">
      <div className="upload-modal">
        <div className="upload-header">
          <b>Upload files</b>
          <button onClick={onClose}>✕</button>
        </div>

        <div
          className="upload-drop"
          onClick={pick}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            setFiles([...e.dataTransfer.files]);
          }}
        >
          Drag & drop or click to browse
        </div>

        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          onChange={e => setFiles([...e.target.files])}
        />

        <div className="upload-list">
          {files.map((f, i) => (
            <div key={i}>{f.name}</div>
          ))}
        </div>

        <div className="upload-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            className="primary"
            onClick={() => {
              onInsert(files);
              setFiles([]);
              onClose();
            }}
          >
            Insert
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
