// utils/createUrlNode.js
import { fabric } from "fabric";

export function createUrlNode(url) {
  return new fabric.Rect({
    width: 260,
    height: 160,
    fill: "#fafafa",
    stroke: "#aaa",
    nodeType: "url",
    meta: { url }
  });
}
