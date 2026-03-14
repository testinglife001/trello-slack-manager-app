// frontend/src/component/canvas/ImageNode.jsx
import React from "react";
export default function ImageNode() {
  return (
    <div className="floating-node image">
      <input type="file" accept="image/*" />
    </div>
  );
}
 