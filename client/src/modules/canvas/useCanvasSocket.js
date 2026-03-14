// modules/canvas/useCanvasSocket.js
// modules/canvas/useCanvasSocket.js
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useCanvasSocket({
  channelId,
  receiveOp,
  setUsers,
  setSelections, // optional — CanvasBoard may not use this yet
}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit("join-channel", channelId);

    socket.on("canvas:op", receiveOp);

    // cursor:update sends an array of active users
    socket.on("cursor:update", setUsers);

    // selection tracking is optional — only wire up if caller provided setter
    if (setSelections) {
      socket.on("selection:update", ({ nodeId, user }) => {
        setSelections(prev => ({
          ...prev,
          [user.id]: { nodeId, name: user.name },
        }));
      });

      socket.on("selection:clear", ({ userId }) => {
        setSelections(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      });
    }

    return () => {
      socket.off("canvas:op", receiveOp);
      socket.off("cursor:update", setUsers);
      socket.off("selection:update");
      socket.off("selection:clear");
      socket.emit("leave-channel", channelId);
    };
  }, [socket, channelId]);
}



/*
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useCanvasSocket({
  channelId,
  receiveOp,
  setUsers,
  setSelections
}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit("join-channel", channelId);

    socket.on("canvas:op", receiveOp);
    socket.on("cursor:update", setUsers);

    socket.on("selection:update", ({ nodeId, user }) => {
      setSelections(prev => ({
        ...prev,
        [user.id]: { nodeId, name: user.name }
      }));
    });

    socket.on("selection:clear", ({ userId }) => {
      setSelections(prev => {
        const c = { ...prev };
        delete c[userId];
        return c;
      });
    });

    return () => {
      socket.off("canvas:op", receiveOp);
      socket.off("cursor:update", setUsers);
      socket.off("selection:update");
      socket.off("selection:clear");
    };
  }, [socket, channelId]);
}
*/



/*
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useCanvasSocket({
  channelId,
  receiveOp,
  setUsers,
  setSelections
}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit("join-channel", channelId);

    socket.on("canvas:op", receiveOp);
    socket.on("cursor:update", setUsers);

    socket.on("selection:update", ({ nodeId, user }) => {
      setSelections(prev => ({
        ...prev,
        [user.id]: { nodeId, name: user.name }
      }));
    });

    socket.on("selection:clear", ({ userId }) => {
      setSelections(prev => {
        const c = { ...prev };
        delete c[userId];
        return c;
      });
    });

    return () => {
      socket.off("canvas:op", receiveOp);
      socket.off("cursor:update", setUsers);
    };
  }, [socket, channelId]);
}
*/











/*
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export default function useCanvasSocket({
  channelId,
  applyPatch,
  setUsers
}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit("canvas:join", channelId);

    socket.on("canvas:patch", applyPatch);
    socket.on("cursor:update", setUsers);

    socket.on("selection:update", ({ nodeId, user }) => {
      setSelections(prev => ({
        ...prev,
        [user.id]: { nodeId, name: user.name }
      }));
    });

    socket.on("selection:clear", ({ userId }) => {
      setSelections(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });

    


    return () => {
      socket.off("canvas:patch", applyPatch);
      socket.off("cursor:update", setUsers);
    };
  }, [socket, channelId]);
}
*/

