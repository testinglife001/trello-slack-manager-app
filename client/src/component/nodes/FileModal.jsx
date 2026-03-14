// components/nodes/FileModal.jsx
import React from "react";

export default function FileModal({ meta, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content">

        {meta.editable ? (
          <textarea defaultValue={meta.content} />
        ) : (
          <iframe src={meta.url} width="100%" height="600" />
        )}

      </div>
    </div>
  );
}
