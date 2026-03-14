// connectorMulti.js
export function connectGroup(canvas, objects) {
  for (let i=0;i<objects.length-1;i++) {
    connectNodes(canvas, objects[i], objects[i+1]);
  }

  objects.forEach(obj=>{
    obj.on("moving", ()=> canvas.renderAll());
  });
}
