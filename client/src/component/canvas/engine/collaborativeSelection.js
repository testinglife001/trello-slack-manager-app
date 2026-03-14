// engine/collaborativeSelection.js

export function setupCollaborativeSelection(canvas, ydoc, socket) {

canvas.on("selection:created", e => {

const obj = e.selected?.[0];
if (!obj) return;

socket.emit("selection-update", {
id: obj.id
});

});

socket.on("selection-update", data => {

canvas.forEachObject(obj => {

if (obj.id === data.id) {
obj.set("stroke", "blue");
}

});

canvas.requestRenderAll();

});

}
