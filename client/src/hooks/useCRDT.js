// 3️⃣ frontend/src/hooks/useCRDT.js
import { useEffect, useContext } from "react";
import { CanvasContext } from "../context/CanvasContext";
import * as Y from "yjs";
import { io } from "socket.io-client";

export default function useCRDT(roomId) {
  const { canvas } = useContext(CanvasContext);

  useEffect(() => {
    if (!canvas) return;

    const ydoc = new Y.Doc();
    const socket = io("http://localhost:5000");

    socket.emit("join-room", roomId);

    socket.on("sync", (updateBuf) => {
      Y.applyUpdate(ydoc, updateBuf);
      canvas.loadFromJSON(ydoc.toJSON(), canvas.renderAll.bind(canvas));
    });

    const pushLocal = () => {
      const updateBuf = Y.encodeStateAsUpdate(ydoc);
      socket.emit("update", updateBuf);
    };

    canvas.on("object:added", pushLocal);
    canvas.on("object:modified", pushLocal);
    canvas.on("object:removed", pushLocal);

    return () => socket.disconnect();
  }, [canvas, roomId]);
}








/*
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useContext } from "react";
import { CanvasContext } from "../context/CanvasContext";

export default function useCRDT(roomId) {
  const { nodes, setNodes, canvas } = useContext(CanvasContext);

  useEffect(() => {
    if (!canvas) return;

    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:1234", roomId, ydoc);

    const yArray = ydoc.getArray("nodes");

    // Apply remote updates to Fabric canvas
    yArray.observeDeep(() => {
      canvas.clear();
      yArray.forEach((n) => canvas.loadFromJSON(n, canvas.renderAll.bind(canvas)));
    });

    // Push local changes
    const pushLocal = () => {
      if (!canvas) return;
      const json = canvas.toJSON();
      yArray.delete(0, yArray.length);
      yArray.push([json]);
    };

    canvas.on("object:added", pushLocal);
    canvas.on("object:modified", pushLocal);
    canvas.on("object:removed", pushLocal);

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [canvas]);
}
*/

