// NodePropertiesPanel.jsx

import { useEffect, useState } from "react";

export default function NodePropertiesPanel({ canvas }) {
  const [object, setObject] = useState(null);

  useEffect(() => {
    if (!canvas) return;

    canvas.on("selection:created", e => {
      setObject(e.selected[0]);
    });

  }, [canvas]);

  if (!object) return <div>Select element</div>;

  const update = (key, value) => {
    object.set(key, value);
    canvas.requestRenderAll();
  };

  return (
    <div>
      <h4>Properties</h4>

      <label>Left</label>
      <input
        type="number"
        value={object.left}
        onChange={(e) => update("left", Number(e.target.value))}
      />

      <label>Top</label>
      <input
        type="number"
        value={object.top}
        onChange={(e) => update("top", Number(e.target.value))}
      />

      <label>Width</label>
      <input
        type="number"
        value={object.width}
        onChange={(e) => update("width", Number(e.target.value))}
      />
    </div>
  );
}
