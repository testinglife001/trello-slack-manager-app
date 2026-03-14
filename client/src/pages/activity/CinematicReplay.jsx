// CinematicReplay.jsx
import { useEffect, useState, useRef } from "react";
import { applyOperation } from "../crdt/reducer";

export default function CinematicReplay({ base, operations, speed = 1 }) {
  const [doc, setDoc] = useState(base);
  const [index, setIndex] = useState(0);
  const timer = useRef();

  // Reset when base or operations change
  useEffect(() => {
    setDoc(base || { nodes: [] });
    setIndex(0);
  }, [base, operations]);

  useEffect(() => {
    if (index >= operations.length) return;

    timer.current = setInterval(() => {
      setIndex(i => {
        if (i >= operations.length) {
          clearInterval(timer.current);
          return i;
        }

        const op = operations[i];
        setDoc(prev => applyOperation(prev, op));
        return i + 1;
      });
    }, 200 / speed);

    return () => clearInterval(timer.current);
  }, [operations, speed, index]);

  return (
    <div className="canvas-layer">
      {doc.nodes?.map(n => (
        <div
          key={n.id}
          className="canvas-node"
          style={{
            left: n.x,
            top: n.y,
            transform: `scale(${n.scaleX || 1}, ${n.scaleY || 1})`,
            opacity: n.opacity ?? 1,
            backgroundColor: n.backgroundColor || "#ffffff",
            color: n.fill || "#000000"
          }}
        >
          {n.type === "image" ? (
            <img src={n.src} alt="" style={{ width: "100%", height: "100%" }} />
          ) : (
            n.data?.text || n.text || n.id
          )}
        </div>
      ))}
    </div>
  );
}
