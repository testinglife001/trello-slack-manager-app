// 📁 modules/canvas/playback/CanvasPlayback.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
// import { applyOperation } from "../crdt/reducer";
import PlaybackControls from "./PlaybackControls";
import { request } from "../../api/client";
import { applyOperation } from "./crdt/reducer";

export default function CanvasPlayback() {
  const { channelId } = useParams();

  const [base, setBase] = useState(null);
  const [ops, setOps] = useState([]);
  const [doc, setDoc] = useState({ nodes: [] });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timer = useRef();

  // =============================
  // LOAD HISTORY
  // =============================
  useEffect(() => {
    const load = async () => {
      const data = await request(`/canvas-playback/${channelId}/playback`);
      setBase(data.snapshot);
      setOps(data.operations);
      setDoc(data.snapshot);
      setIndex(0);
    };

    load();
  }, [channelId]);

  // =============================
  // PLAY LOOP
  // =============================
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

  if (!base) return null;

  return (
    <div className="canvas-playback">
      <PlaybackControls
        playing={playing}
        setPlaying={setPlaying}
        index={index}
        max={ops.length}
        jump={(i) => {
          setPlaying(false);
          let rebuilt = base;
          for (let j = 0; j < i; j++) {
            rebuilt = applyOperation(rebuilt, ops[j]);
          }
          setDoc(rebuilt);
          setIndex(i);
        }}
      />

      <div className="canvas-board">
        {doc.nodes.map(n => (
          <div
            key={n.id}
            className="canvas-node"
            style={{ left: n.x, top: n.y }}
          >
            {n.data?.text}
          </div>
        ))}
      </div>
    </div>
  );
}
