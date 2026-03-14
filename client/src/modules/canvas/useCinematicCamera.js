// 📁 useCinematicCamera.js
import { useRef } from "react";

export default function useCinematicCamera() {
  const ref = useRef();

  const focus = (x, y) => {
    if (!ref.current) return;

    ref.current.style.transform =
      `translate(${-x + window.innerWidth / 2}px, ${-y + window.innerHeight / 2}px)`;
  };

  return { ref, focus };
}
