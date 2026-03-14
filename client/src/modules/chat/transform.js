// modules/canvas/crdt/transform.js
export function transform(incoming, against) {
  // if target already deleted → ignore move/update
  if (
    against.type === "node.delete" &&
    incoming.target === against.target &&
    incoming.type !== "node.delete"
  ) {
    return null;
  }

  // last write wins for position
  if (
    incoming.type === "node.move" &&
    against.type === "node.move" &&
    incoming.target === against.target
  ) {
    return {
      ...incoming,
      payload: against.payload
    };
  }

  return incoming;
}
