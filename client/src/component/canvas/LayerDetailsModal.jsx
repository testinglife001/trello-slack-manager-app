// frontend/src/component/canvas/LayerDetailsModal.jsx
// frontend/src/component/canvas/LayerDetailsModal.jsx
import { useState, useEffect } from "react";

export default function LayerDetailsModal({ object, open, onClose, onDelete }) {
  const [props, setProps] = useState({});

  useEffect(() => {
    if (!object) return;
    setProps({
      left: object.left,
      top: object.top,
      width: object.width,
      height: object.height,
      type: object.customType || object.type,
      id: object.id,
      name: object.name || "",
      visible: object.visible,
    });
  }, [object]);

  if (!open || !object) return null;

  const handleChange = (key, value) => {
    object.set(key, value);
    setProps(prev => ({ ...prev, [key]: value }));
    object.canvas?.requestRenderAll();
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
    }}>
      <div className="modal-container" style={{
        background: "#fff", padding: 20, borderRadius: 8, width: 300, boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
      }}>
        <h3 style={{ marginTop: 0 }}>Layer Details</h3>
        <p><strong>Type:</strong> {props.type}</p>
        {["left","top","width","height"].map(key => (
          <div key={key} style={{ marginBottom: 6 }}>
            <label>{key.charAt(0).toUpperCase()+key.slice(1)}</label>
            <input
              type="number"
              value={props[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        ))}
        <label>
          <input
            type="checkbox"
            checked={props.visible}
            onChange={(e) => handleChange("visible", e.target.checked)}
          /> Visible
        </label>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => { onDelete(object); onClose(); }}>Delete</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
