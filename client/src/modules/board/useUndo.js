// 📁 useUndo.js
import { useRef } from "react";

export default function useUndo(setLists) {
  const stack = useRef([]);

  const push = (state) => {
    stack.current.push(JSON.stringify(state));
  };

  const undo = () => {
    const last = stack.current.pop();
    if (last) setLists(JSON.parse(last));
  };

  return { push, undo };
}
