// modules/board/useBoardSocket.js
// ✅ useBoardSocket.js (correct + safe)
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useBoardSocket(arg) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // ===================================
    // MODE 1 → legacy reload()
    // ===================================
    if (typeof arg === "function") {
      const handler = () => arg();

      socket.on("card:moved", handler);
      socket.on("card:created", handler);
      socket.on("card:deleted", handler);
      socket.on("list:updated", handler);
      socket.on("subtask:updated", handler);
      socket.on("attachment:add", handler);

      return () => {
        socket.off("card:moved", handler);
        socket.off("card:created", handler);
        socket.off("card:deleted", handler);
        socket.off("list:updated", handler);
        socket.off("subtask:updated", handler);
        socket.off("attachment:add", handler);
      };
    }

    // ===================================
    // MODE 2 → granular
    // ===================================
    const {
      onCardCreated,
      onCardDeleted,
      onCardMoved
    } = arg || {};

    onCardCreated && socket.on("card:created", onCardCreated);
    onCardDeleted && socket.on("card:deleted", onCardDeleted);
    onCardMoved && socket.on("card:moved", onCardMoved);

    return () => {
      onCardCreated && socket.off("card:created", onCardCreated);
      onCardDeleted && socket.off("card:deleted", onCardDeleted);
      onCardMoved && socket.off("card:moved", onCardMoved);
    };
  }, [socket, arg]);
}









/*
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useBoardSocket(reload) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = () => reload();

    socket.on("card:moved", handler);
    socket.on("card:created", handler);
    socket.on("card:deleted", handler);
    socket.on("list:updated", handler);
    socket.on("subtask:updated", handler);
    socket.on("attachment:add", handler);

    return () => {
      socket.off("card:moved", handler);
      socket.off("card:created", handler);
      socket.off("card:deleted", handler);
      socket.off("list:updated", handler);
      socket.off("subtask:updated", handler);
      socket.off("attachment:add", handler);
    };
  }, [socket, reload]);
}
*/


/*
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
// import { useSocket } from "../../contexts/SocketContext";

export default function useBoardSocket(setLists) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("card:moved", (data) => {
      // easiest strategy → reload board
      // later we optimize
      setLists(prev => [...prev]);
    });

    socket.on("attachment:add", reload);
    socket.on("subtask:updated", reload);


    return () => {
      socket.off("card:moved");
    };
  }, [socket]);
}
*/
