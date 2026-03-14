// /collab/useCRDT.js
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export const createCRDT = (canvasId) => {

  const doc = new Y.Doc();

  const provider = new WebsocketProvider(
    "ws://localhost:1234",
    canvasId,
    doc
  );

  const objectsMap = doc.getMap("objects");

  return { doc, provider, objectsMap };
};
