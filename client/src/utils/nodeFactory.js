// frontend/src/utils/nodeFactory.js
import { fabric } from "fabric";

export const createTextNode = (text, options = {}) =>
  new fabric.Textbox(text, { width: 150, fontSize: 16, fill: "#000", ...options });

// Returns a Promise — use: createImageNode(url).then(img => canvas.add(img))
export const createImageNode = (url, options = {}) =>
  new Promise((resolve) => {
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(150);
      img.set(options);
      resolve(img);
    });
  });

// Placeholder rect that carries the video URL as metadata
export const createVideoNode = (url, options = {}) => {
  const rect = new fabric.Rect({ width: 200, height: 120, fill: "#000", ...options });
  rect.videoUrl = url;
  return rect;
};

export const createTaskCardNode = (title, options = {}) =>
  new fabric.Group(
    [
      new fabric.Rect({ width: 180, height: 100, fill: "#f9f9a9", rx: 8, ry: 8 }),
      new fabric.Text(title, { left: 10, top: 10, fontSize: 14 }),
    ],
    options
  );