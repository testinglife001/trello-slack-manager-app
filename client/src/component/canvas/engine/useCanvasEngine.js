// src/engine/useCanvasEngine.js

import { useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { bindFabricToYjs } from "./yjsFabricSync";
import { setupCollaborativeSelection } from "./collaborativeSelection";

export function useCanvasEngine(roomId, canvas, socket) {

useEffect(() => {

if (!roomId || !canvas) return;

const ydoc = new Y.Doc();

const provider = new WebsocketProvider(
"wss://your-collab-server",
roomId,
ydoc
);

const yCanvas = ydoc.getMap("fabric");

bindFabricToYjs(canvas, yCanvas);

setupCollaborativeSelection(canvas, ydoc, socket);

return () => {
provider.destroy();
ydoc.destroy();
};

}, [roomId, canvas]);

}