// src/components/UI/Avatar.jsx
import React from "react";

export default function Avatar({ src, alt, size = "8" }) {
  return (
    <img
      className={`rounded-full w-${size} h-${size} object-cover`}
      src={src}
      alt={alt}
    />
  );
}