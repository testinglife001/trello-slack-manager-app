// frontend/src/utils/history.js
export function createHistory(limit = 50) {
  let undoStack = [];
  let redoStack = [];

  return {
    push(state) {
      undoStack.push(JSON.stringify(state));
      if (undoStack.length > limit) undoStack.shift();
      redoStack = []; // new action invalidates redo
    },

    undo(current) {
      if (!undoStack.length) return null;
      redoStack.push(JSON.stringify(current));
      return JSON.parse(undoStack.pop());
    },

    redo(current) {
      if (!redoStack.length) return null;
      undoStack.push(JSON.stringify(current));
      return JSON.parse(redoStack.pop());
    },

    clear() {
      undoStack = [];
      redoStack = [];
    },

    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
  };
}