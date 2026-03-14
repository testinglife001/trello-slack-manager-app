// components/Avatar.jsx

import './Avatar.css'

export default function Avatar({ src, name, size = 32 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="avatar"
      />
    );
  }

  const letter = name?.charAt(0)?.toUpperCase();

  return (
    <div
      className="avatar avatar-fallback"
      style={{ width: size, height: size }}
    >
      {letter}
    </div>
  );
}
