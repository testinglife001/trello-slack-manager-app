// engine/infiniteRenderer.js
export function setupInfiniteTiling(canvas) {

const TILE = 2000;

canvas.on("after:render", () => {

const ctx = canvas.getContext();

const vpt = canvas.viewportTransform;

const left = -vpt[4] / vpt[0];
const top = -vpt[5] / vpt[3];

for (let x = left - TILE; x < left + TILE * 2; x += TILE) {
for (let y = top - TILE; y < top + TILE * 2; y += TILE) {

ctx.strokeStyle = "#eee";
ctx.strokeRect(x, y, TILE, TILE);

}
}

});

}