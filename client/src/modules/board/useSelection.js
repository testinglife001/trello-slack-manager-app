// 📁 useSelection.js
import { useState } from "react";

export default function useSelection() {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const clear = () => setSelected([]);

  return { selected, toggle, clear };
}
