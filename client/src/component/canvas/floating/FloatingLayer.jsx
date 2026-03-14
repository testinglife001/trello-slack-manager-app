// 📁 FloatingLayer.jsx
import React from "react";
import NoteNode from "./NoteNode";
import ImageNode from "./ImageNode";

export default function FloatingLayer() {
  return (
    <div className="floating-layer">
      <NoteNode />
      <ImageNode />
    </div>
  );
}

