// modules/chat/MessageHoverBar.jsx
export default function MessageHoverBar({
  onReact,
  onReply,
  onEdit,
  onDelete
}) {
  return (
    <div className="hover-bar">
      <button onClick={onReact}>😊</button>
      <button onClick={onReply}>Reply</button>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>🗑</button>
    </div>
  );
}
