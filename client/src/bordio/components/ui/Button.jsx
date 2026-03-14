// src/components/UI/Button.jsx
import React from "react";

export default function Button({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded font-medium hover:opacity-90 transition ${className}`}
    >
      {children}
    </button>
  );
}