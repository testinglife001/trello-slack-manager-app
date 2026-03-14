// // src/hooks/useCanvasSocket.js
import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";

export default function useCanvasSocket(
  channelId,
  onCanvasUpdate,
  onMention,
  onPresence
) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit("join-channel", channelId);
    socket.emit("join-canvas", {
      channelId,
    });

    // socket.on("canvas:update", onCanvasUpdate);
    // socket.on("mention", onMention);
    socket.on("presence:update", onPresence);

    return () => {
      socket.off("canvas:update", onCanvasUpdate);
      socket.off("mention", onMention);
      socket.off("presence:update", onPresence);
    };
  }, [socket, channelId]);
}
