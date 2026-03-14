// components/Dropdown.jsx

import './Dropdown.css'

import { useState, useRef, useEffect } from "react";

export default function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const click = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>
        {trigger}
      </div>

      {open && <div className="dropdown-menu">{children}</div>}
    </div>
  );
}
