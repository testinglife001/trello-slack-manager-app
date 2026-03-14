// modules/canvas/crdt/reducer.js

export function applyOperation(doc, op) {
  const next = { nodes: [...(doc?.nodes || [])] };

  switch (op.type) {
    case "node.add":
      next.nodes.push({
        ...op.payload,
        order: Number(op.payload.order) || Date.now()
      });
      break;

    case "node.move":
      next.nodes = next.nodes.map(n =>
        n.id === op.target ? { ...n, ...op.payload } : n
      );
      break;

    case "node.delete":
      next.nodes = next.nodes.filter(n => n.id !== op.target);
      break;

    case "node.update":
      next.nodes = next.nodes.map(n =>
        n.id === op.target
          ? { ...n, data: { ...n.data, ...op.payload } }
          : n
      );
      break;
  }

  next.nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return next;
}





/*
export function applyOperation(doc, op) {
  const next = { ...doc };

  switch (op.type) {
    case "node.add":
      next.nodes.push(op.payload);
      next.nodes.sort((a, b) => (a.order || 0) - (b.order || 0));

      break;

    case "node.move":
      next.nodes = next.nodes.map(n =>
        n.id === op.target ? { ...n, ...op.payload } : n
      );
      next.nodes.sort((a, b) => (a.order || 0) - (b.order || 0));

      break;

    case "node.delete":
      next.nodes = next.nodes.filter(n => n.id !== op.target);
      break;

    case "node.update":
      next.nodes = next.nodes.map(n =>
        n.id === op.target
          ? { ...n, data: { ...n.data, ...op.payload } }
          : n
      );
      break;
  }

  return next;
}
*/
