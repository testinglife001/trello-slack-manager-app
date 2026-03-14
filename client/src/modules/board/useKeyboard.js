// 📁 useKeyboard.js
import { useEffect } from "react";

export default function useKeyboard({ onDelete, onUndo }) {
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Delete") onDelete?.();
      if ((e.metaKey || e.ctrlKey) && e.key === "z") onUndo?.();
    };

    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onDelete, onUndo]);
}
