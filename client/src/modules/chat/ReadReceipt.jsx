// modules/chat/ReadReceipt.jsx
export default function ReadReceipt({ message }) {
  if (!message.readBy?.length) return null;

  return (
    <div className="read-receipt">
      Seen by {message.readBy.length}
    </div>
  );
}
