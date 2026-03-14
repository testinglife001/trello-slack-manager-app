// CanvasVideoOverlay.jsx

import { useEffect } from "react";

export default function CanvasVideoOverlay({ canvas }) {
  useEffect(() => {
    if (!canvas) return;

    const update = () => {
      const videos = canvas.getObjects().filter(o => o.customType === "video");

      videos.forEach(obj => {
        let el = document.getElementById(`video-${obj.id}`);

        if (!el) {
          el = document.createElement("video");
          el.id = `video-${obj.id}`;
          el.src = obj.videoUrl;
          el.controls = true;
          el.style.position = "absolute";
          document.querySelector(".canvas-wrapper").appendChild(el);
        }

        const zoom = canvas.getZoom();
        el.style.left = obj.left * zoom + "px";
        el.style.top = obj.top * zoom + "px";
        el.style.width = obj.width * zoom + "px";
        el.style.height = obj.height * zoom + "px";
      });
    };

    canvas.on("after:render", update);
    return () => canvas.off("after:render", update);
  }, [canvas]);

  return null;
}
