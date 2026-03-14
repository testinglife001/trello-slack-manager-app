// engine/yjsFabricSync.js


import * as Y from "yjs";

export function bindFabricToYjs(canvas, yMap) {

canvas.on("object:added", e => {

const obj = e.target;

if (!obj.id) obj.id = Date.now().toString();

yMap.set(obj.id, obj.toObject());

});

canvas.on("object:modified", e => {

const obj = e.target;

yMap.set(obj.id, obj.toObject());

});

canvas.on("object:removed", e => {

const obj = e.target;

yMap.delete(obj.id);

});

yMap.observe(() => {

const objs = yMap.toJSON();

canvas.clear();

Object.values(objs).forEach(data => {
canvas.add(new fabric.Object(data));
});

canvas.requestRenderAll();

});

}