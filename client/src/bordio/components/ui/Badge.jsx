// src/components/UI/Badge.jsx
import React from "react";

export default function Badge({ text, color = "blue" }) {
  const bgColor = `bg-${color}-100`;
  const textColor = `text-${color}-700`;
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
}