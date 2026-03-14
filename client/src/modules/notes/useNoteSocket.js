// useNoteSocket.js
// 🧩 2) Socket Engine (the brain)
// modules/notes/useNoteSocket.js
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../services/api";

export default function useNoteSocket(noteId) {
  const socket = useSocket();

  const [presence, setPresence] = useState([]);
  const [remotePatch, setRemotePatch] = useState(null);

  const timer = useRef(null);

  // ===============================
  // JOIN ROOM
  // ===============================
  const join = () => {
    socket?.emit("note:join", noteId);
  };

  // ===============================
  // SEND PATCH
  // ===============================
  const sendPatch = (content) => {
    if (!socket) return;

    // realtime broadcast
    socket.emit("note:patch", { noteId, content });

    // debounce DB persist
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      request(`/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({ content })
      });
    }, 1200);
  };

  // ===============================
  // LISTEN REMOTE
  // ===============================
  useEffect(() => {
    if (!socket) return;

    const patchHandler = (data) => {
      if (data.noteId !== noteId) return;
      setRemotePatch(data.content);
    };

    const presenceHandler = (users) => {
      setPresence(users);
    };

    socket.on("note:update", patchHandler);
    socket.on("note:presence", presenceHandler);

    return () => {
      socket.off("note:update", patchHandler);
      socket.off("note:presence", presenceHandler);
    };
  }, [socket, noteId]);

  return {
    join,
    sendPatch,
    presence,
    remotePatch
  };
}







/*
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useNoteSocket(noteId) {
  const socket = useSocket();
  const [presence, setPresence] = useState([]);
  const [remotePatch, setRemotePatch] = useState(null);

  let timer; 
  const sendPatch = (content) => { 
    ocket?.emit("note:patch", { noteId, content });
    clearTimeout(timer); 
    timer = setTimeout(() => { 
        fetch(/api/notes/${noteId}, 
            { 
                method: "PUT", 
                body: JSON.stringify({ content }) }); }, 1200); 
            };

  const join = () => {
    socket?.emit("note:join", noteId);
  };

  
  useEffect(() => {
    if (!socket) return;

    socket.on("note:presence", setPresence);

    socket.on("note:update", ({ noteId: id, content }) => {
      if (id !== noteId) return;
      setRemotePatch(content);
    });

    return () => {
      socket.off("note:presence");
      socket.off("note:update");
    };
  }, [socket, noteId]);

  return { join, sendPatch, presence, remotePatch };
}
*/
