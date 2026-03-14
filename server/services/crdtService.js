// backend/services/crdtService.js
// backend/services/crdtService.js
const Y = require("yjs");
const CanvasDocument = require("../models/CanvasDocument");
// const Canvas = require("../models/Canvas"); // adjust name if needed

// Maintain Yjs docs in memory
const docs = new Map();

/**
 * Get or create Y.Doc for a room
 */
function getYDoc(roomId) {
  if (!roomId) {
    throw new Error("roomId is required for getYDoc()");
  }

  if (!docs.has(roomId)) {
    docs.set(roomId, new Y.Doc());
  }

  return docs.get(roomId);
}

/**
 * Get all docs (for autosave loop)
 */
function getAllDocs() {
  return docs;
}

/**
 * Persist a Y.Doc to MongoDB
 */
async function saveYDocToDB(roomId) {
  const ydoc = docs.get(roomId);
  if (!ydoc) return;

  try {
    const update = Y.encodeStateAsUpdate(ydoc);

    await CanvasDocument.findOneAndUpdate(
      { channel: roomId },
      {
        content: Buffer.from(update),
        updatedAt: new Date()
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("CRDT Save Error:", err);
  }
}

module.exports = {
  getYDoc,
  getAllDocs,
  saveYDocToDB
};
