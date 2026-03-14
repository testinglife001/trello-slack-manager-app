// modules/chat/JumpToUnread.jsx
export default function JumpToUnread({ onClick }) {
  return (
    <div className="jump-unread" onClick={onClick}>
      Jump to latest ↓
    </div>
  );
}
