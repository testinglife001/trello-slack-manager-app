// modules/canvas/useCursorBroadcast.js
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

export default function useCursorBroadcast(channelId) {
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !channelId || !user) return;

    let frame;

    const move = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        socket.emit("cursor:update", {
          channel: channelId,
          x: e.clientX,
          y: e.clientY,
          user: { id: user._id, name: user.name }
        });
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [socket, channelId, user]);
}



/*
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

export default function useCursorBroadcast(channelId) {
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !channelId) return;

    const move = (e) => {
      socket.emit("cursor:update", {
        channel: channelId,
        x: e.clientX,
        y: e.clientY,
        user: {
          id: user._id,
          name: user.name
        }
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [socket, channelId, user]);
}
*/

