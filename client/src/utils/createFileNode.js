// utils/createFileNode.js
import { fabric } from "fabric";

export function createFileNode(meta) {
  return new fabric.Rect({
    width: 220,
    height: 140,
    fill: "#fff",
    stroke: "#999",
    rx: 8,
    ry: 8,
    hasControls: true,
    nodeType: "file",
    meta
  });
}
