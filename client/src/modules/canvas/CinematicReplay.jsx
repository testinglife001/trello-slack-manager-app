// 📁 CinematicReplay.jsx
import { useEffect, useState, useRef } from "react";
import { applyOperation } from "../crdt/reducer";
import useCinematicCamera from "./useCinematicCamera";
import GhostCursors from "./GhostCursors";

export default function CinematicReplay({ base, operations }) {
  const [doc, setDoc] = useState(base);
  const [index, setIndex] = useState(0);
  const [actors, setActors] = useState([]);
  const [speed, setSpeed] = useState(1);

  const timer = useRef();
  const { ref, focus } = useCinematicCamera();

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex(i => {
        if (i >= operations.length) {
          clearInterval(timer.current);
          return i;
        }

        const op = operations[i];

        setDoc(prev => applyOperation(prev, op));

        if (op.payload?.x) focus(op.payload.x, op.payload.y);

        setActors(a => [
          ...a.filter(x => x.id !== op.actor.id),
          { ...op.actor, x: op.payload?.x, y: op.payload?.y }
        ]);

        return i + 1;
      });
    }, 200 / speed);

    return () => clearInterval(timer.current);
  }, [operations, speed]);

  return (
    <div className="cinematic-stage">
      <div ref={ref} className="camera-layer">
        {doc.nodes.map(n => (
          <div
            key={n.id}
            className="canvas-node pulse"
            style={{ left: n.x, top: n.y }}
          >
            {n.data?.text}
          </div>
        ))}
      </div>

      <GhostCursors actors={actors} />

      <div className="speed">
        <button onClick={() => setSpeed(0.5)}>0.5x</button>
        <button onClick={() => setSpeed(1)}>1x</button>
        <button onClick={() => setSpeed(2)}>2x</button>
      </div>
    </div>
  );
}
