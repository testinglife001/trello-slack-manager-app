// 2️⃣ BoardCreationModal.jsx
// frontend/src/components/boards/BoardCreationModal.jsx

import { useState, useEffect } from "react";
import { request } from "../../api/client";

export default function BoardCreationModal({
  open,
  onClose,
  canvas,
  onBoardCreated
}) {
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate thumbnail from Fabric canvas
  const generateThumbnail = () => {
    if (!canvas) return null;

    try {
      const dataUrl = canvas.toDataURL({
        format: "png",
        multiplier: 0.2 // smaller thumbnail
      });

      setThumbnail(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error("Thumbnail generation failed", err);
      return null;
    }
  };

  const saveSnapshot = async () => {
    const fabricJson = canvas.toJSON();

    const thumbnail = canvas.toDataURL({
      format: "png",
      multiplier: 0.15
    });

    await request("/mycanvas/snapshots", {
      method: "POST",
      body: {
        boardId: activeBoard._id,
        fabricJson,
        thumbnail
      }
    });
  };

  // Auto generate when modal opens
  useEffect(() => {
    if (open && canvas) {
      generateThumbnail();
    }
  }, [open, canvas]);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const payload = {
        name,
        thumbnail
      };

      const board = await request("/mycanvas/boards", {
        method: "POST",
        body: payload
      });

      onBoardCreated?.(board);

      setName("");
      setThumbnail(null);
      onClose();
    } catch (err) {
      console.error("Board creation failed", err);
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Create New Board</h2>

        <input
          type="text"
          placeholder="Board name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Thumbnail Preview */}
        <div className="thumbnail-preview">
          <h4>Preview</h4>

          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Board Preview"
              style={{
                width: "200px",
                height: "120px",
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #ddd"
              }}
            />
          ) : (
            <div className="empty-preview">
              No preview available
            </div>
          )}

          <button onClick={generateThumbnail}>
            Refresh Preview
          </button>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Board"}
          </button>
        </div>

      </div>
    </div>
  );
}








/*
// frontend/src/component/canvas/BoardCreationModal.jsx
import { useState } from "react";
import { request } from "../../api/client";

export default function BoardCreationModal({ open, onClose, roomId, onBoardCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const createBoard = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const board = await request("/mycanvas/board", {
        method: "POST",
        body: JSON.stringify({ roomId, name }),
      });
      onBoardCreated(board);
      setName("");
      onClose();
    } catch (err) {
      console.error("Board creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ padding: 16, background: "#fff", width: 300 }}>
        <h3>Create New Board</h3>
        <input
          type="text"
          placeholder="Board Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={createBoard} disabled={loading}>{loading ? "Creating..." : "Create"}</button>
        </div>
      </div>
    </div>
  );
}
*/
