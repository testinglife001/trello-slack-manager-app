// ✅ components/Aviatar.jsx
import './Aviatar.css'

function generateInitials(name = "") {
  if (!name) return "U";
    
  const cleaned = name.trim();

  // Split by spaces
  const words = cleaned.split(/\s+/);

  // Multi-word name → First letter of each word (uppercase)
  if (words.length > 1) {
    return words
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 3); // limit max 3 letters
  }

  // Single word → First 3 letters
  const firstThree = cleaned.slice(0, 3);

  return (
    firstThree.charAt(0).toUpperCase() +
    firstThree.slice(1).toLowerCase()
  );
}

export default function Aviatar({ user, size = 32 }) {
  const src = user?.avatar;
  const displayName = user?.name || user?.username || "U";

  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        style={{ width: size, height: size }}
        className="avatar"
      />
    );
  }

  const initials = generateInitials(displayName);

  return (
    <div
      className="avatar avatar-fallback"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
