// 📁 fabricHelpers.js



export function setupCanvas(canvas) {
  let panning = false;

  canvas.on("mouse:down", (opt) => {
    if (opt.e.altKey) panning = true;
  });

  canvas.on("mouse:move", (opt) => {
    if (!panning) return;
    const e = opt.e;
    canvas.relativePan({ x: e.movementX, y: e.movementY });
  });

  canvas.on("mouse:up", () => {
    panning = false;
  });
}



