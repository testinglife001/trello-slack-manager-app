// ✳️ Unread Badge
export default function UnreadBadge({ count, mention }) {
  if (!count) return null;

  return (
    <span className={`badge ${mention ? "mention" : ""}`}>
      {count}
    </span>
  );
}
