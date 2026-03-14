// engine/timelineEngine.js
export function playTimeline(canvas, snapshots, fps = 2) {

let i = 0;

const interval = setInterval(() => {

const snap = snapshots[i];
if (!snap) {
clearInterval(interval);
return;
}

canvas.loadFromJSON(snap.fabricJson, () => {
canvas.renderAll();
});

i++;

}, 1000 / fps);

}
