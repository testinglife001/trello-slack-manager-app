// 📁 LayersPanel.jsx
import React, { useContext, useState, useEffect } from "react";
import { CanvasContext } from "../../context/CanvasContext";

export default function LayersPanel() {
  const { canvas } = useContext(CanvasContext);
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (!canvas) return;

    const refresh = () => {
      setObjects([...canvas.getObjects()]);
    };

    canvas.on("object:added", refresh);
    canvas.on("object:removed", refresh);

    refresh();
  }, [canvas]);

  const selectLayer = (obj) => {
    canvas.setActiveObject(obj);
    canvas.renderAll();
  };

  return (
    <div className="layers-panel">
      <h4>Layers</h4>
      {objects.map((obj, i) => (
        <div key={i} onClick={() => selectLayer(obj)}>
          Layer {i + 1}
        </div>
      ))}
    </div>
  );
}



