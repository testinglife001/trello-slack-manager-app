// hooks/usePortalSync.js
import { useEffect, useState } from "react";

export default function usePortalSync(canvas) {
  const [portalNodes, setPortalNodes] = useState([]);

  useEffect(() => {
    if (!canvas) return;

    const update = () => {
      const nodes = canvas.getObjects()
        .filter(obj => obj.nodeType)
        .map(obj => ({
          id: obj._uuid,
          nodeType: obj.nodeType,
          meta: obj.meta,
          left: obj.left,
          top: obj.top,
          width: obj.width * obj.scaleX,
          height: obj.height * obj.scaleY,
        }));

      setPortalNodes(nodes);
    };

    canvas.on("object:added", update);
    canvas.on("object:modified", update);
    canvas.on("object:moving", update);
    canvas.on("object:removed", update);

    update();

    return () => {
      canvas.off("object:added", update);
    };
  }, [canvas]);

  return portalNodes;
}
