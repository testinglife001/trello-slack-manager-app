// modules/canvas/crdt/opQueue.js
export default function createQueue() {
  const pending = new Map();

  return {
    add(op) {
      pending.set(op.id, op);
    },
    remove(id) {
      pending.delete(id);
    },
    all() {
      return [...pending.values()];
    }
  };
}
