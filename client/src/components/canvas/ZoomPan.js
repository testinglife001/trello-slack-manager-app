// canvas/ZoomPan.js
export function enableZoomPan(canvas){

 let panning=false;

 canvas.on("mouse:wheel",opt=>{
   let zoom=canvas.getZoom();
   zoom*=0.999 ** opt.e.deltaY;

   zoom=Math.min(3,Math.max(0.3,zoom));
   canvas.zoomToPoint(
     {x:opt.e.offsetX,y:opt.e.offsetY},
     zoom
   );
   opt.e.preventDefault();
 });

 canvas.on("mouse:down",opt=>{
   if(opt.e.altKey){
     panning=true;
     canvas.selection=false;
   }
 });

 canvas.on("mouse:move",opt=>{
   if(panning){
     canvas.relativePan({
       x:opt.e.movementX,
       y:opt.e.movementY
     });
   }
 });

 canvas.on("mouse:up",()=>{
   panning=false;
   canvas.selection=true;
 });
}
