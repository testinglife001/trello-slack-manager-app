// modules/chat/ReactionPicker.jsx
const emojis = ["👍", "🔥", "✅", "🎉", "👀"];

export default function ReactionPicker({ onSelect }) {
  return (
    <div className="reaction-picker">
      {emojis.map(e => (
        <button key={e} onClick={() => onSelect(e)}>
          {e}
        </button>
      ))}
    </div>
  );
}
