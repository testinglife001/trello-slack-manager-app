// 🧩 useSmoothDrag.js
import { useRef } from "react";

export default function useSmoothDrag({ onDrop }) {
  const ghost = useRef(null);
  const dragging = useRef(null);

  const start = (e, card) => {
    dragging.current = card;

    const rect = e.currentTarget.getBoundingClientRect();
    const clone = e.currentTarget.cloneNode(true);

    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.zIndex = 9999;
    clone.classList.add("drag-preview");

    document.body.appendChild(clone);
    ghost.current = clone;

    requestAnimationFrame(() => {
      clone.style.transition = "none";
    });
  };

  const move = (e) => {
    if (!ghost.current) return;

    ghost.current.style.transform =
      `translate3d(${e.clientX + 8}px, ${e.clientY + 8}px, 0)`;
  };

  const end = (e) => {
    if (!ghost.current) return;

    onDrop?.(dragging.current, e);

    ghost.current.remove();
    ghost.current = null;
    dragging.current = null;
  };

  return { start, move, end };
}
