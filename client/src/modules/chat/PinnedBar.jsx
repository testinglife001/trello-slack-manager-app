// 🧩 STEP 8 — Pinned Messages Bar
import { useParams } from "react-router-dom";
import { useChat } from "./ChatStore";

export default function PinnedBar() {
  const { channelId } = useParams();
  const { state } = useChat();

  const pins = state.pinned[channelId] || [];

  if (!pins.length) return null;

  return (
    <div className="pinned">
      📌 {pins.length} pinned
    </div>
  );
}

