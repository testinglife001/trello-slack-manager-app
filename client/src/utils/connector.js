// frontend/src/utils/connector.js
import { fabric } from "fabric";

/**
 * connectNodes — Bezier curve that re-draws itself when either node moves.
 * Returns the path object so callers can store/remove it later.
 */
export function connectNodes(canvas, nodeA, nodeB, options = {}) {
  const { stroke = "#000", strokeWidth = 2 } = options;
  if (!nodeA || !nodeB) return null;

  const getCenter = (obj) => ({
    x: (obj.left || 0) + (obj.width || 0) / 2,
    y: (obj.top || 0) + (obj.height || 0) / 2,
  });

  const line = new fabric.Path("M 0 0", {
    stroke,
    strokeWidth,
    fill: null,
    selectable: false,
    evented: false,
    objectCaching: false,
  });

  const update = () => {
    const a = getCenter(nodeA);
    const b = getCenter(nodeB);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    line.set({
      path: fabric.util.parsePath(`M ${a.x} ${a.y} C ${a.x} ${my} ${mx} ${b.y} ${b.x} ${b.y}`),
    });
    canvas.renderAll();
  };

  canvas.add(line);
  canvas.sendToBack(line);
  update();

  nodeA.on("moving", update);
  nodeB.on("moving", update);

  return line;
}

/**
 * interConnectNodes — simple straight Line connector (no live update).
 * Useful for static diagrams or when performance matters.
 */
export function interConnectNodes(canvas, nodeA, nodeB, options = {}) {
  const line = new fabric.Line(
    [
      (nodeA.left || 0) + (nodeA.width || 0) / 2,
      (nodeA.top || 0) + (nodeA.height || 0) / 2,
      (nodeB.left || 0) + (nodeB.width || 0) / 2,
      (nodeB.top || 0) + (nodeB.height || 0) / 2,
    ],
    { stroke: "#333", strokeWidth: 2, selectable: false, evented: false, ...options }
  );
  canvas.add(line);
  canvas.sendToBack(line);
  return line;
}