// utils/connectors.js
export function bindConnector(line, from, to){

 function update(){
   line.set({
     x1: from.left,
     y1: from.top,
     x2: to.left,
     y2: to.top
   });
 }

 from.on("moving",update);
 to.on("moving",update);
}
