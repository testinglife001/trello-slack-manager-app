// /engine/ai/layoutEngine.js
export function autoLayout(nodes, connectors) {

  const levels = {};

  connectors.forEach(c => {
    const level = (levels[c.from] || 0) + 1;
    levels[c.to] = Math.max(levels[c.to] || 0, level);
  });

  return nodes.map(n => ({
    ...n,
    x: (levels[n.id] || 0) * 300,
    y: Math.random() * 600
  }));
}


/*
Trigger
const layouted = autoLayout(nodes, connectors);
ydoc.transact(() => {
  layouted.forEach(updateNode);
});

Later upgrade:

AI prompt → graph intent → layout selection
*/
