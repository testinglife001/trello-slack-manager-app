// CanvasReplay.jsx (Time-travel playback)
import { useEffect, useState, useRef } from "react";
import { request } from "../api/client";
import { applyOperation } from "./crdt/reducer";

export default function CanvasReplay({ channelId }) {
  const [base, setBase] = useState(null);
  const [ops, setOps] = useState([]);
  const [doc, setDoc] = useState({ nodes: [] });
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const timer = useRef();

  useEffect(() => {
    const load = async () => {
      const data = await request(`/canvas-playback/${channelId}/playback`);
      setBase(data.snapshot);
      setOps(data.operations);
      setDoc(data.snapshot);
    };
    load();
  }, [channelId]);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setIndex(i => {
        if (i >= ops.length) {
          clearInterval(timer.current);
          return i;
        }
        setDoc(prev => applyOperation(prev, ops[i]));
        return i + 1;
      });
    }, 200);
    return () => clearInterval(timer.current);
  }, [playing, ops]);

  return (
    <div>
      <button onClick={() => setPlaying(p => !p)}>{playing ? "Pause" : "Play"}</button>
      <div className="canvas-board">
        {doc.nodes.map(n => (
          <div key={n.id} style={{ left: n.x, top: n.y }} className="canvas-node">{n.data?.text}</div>
        ))}
      </div>
    </div>
  );
}
