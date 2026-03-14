// canvas/FabricBoard.jsx

import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useCanvas } from "../context/CanvasContext";

export default function FabricBoard() {
  const ref = useRef();
  const { setZoom } = useCanvas();

  useEffect(() => {
    const canvas = new fabric.Canvas("fabric", {
      selection: true
    });

    ref.current = canvas;
    let drawingObject = null;
    let startX, startY;

    let connectorStart=null;

    canvas.on("mouse:down", e=>{
        if(tool!=="connector") return;

        const obj=e.target;
        if(!obj) return;

        if(!connectorStart){
            connectorStart=obj;
        }else{
            const line=new fabric.Line([
                connectorStart.left,
                connectorStart.top,
                obj.left,
                obj.top
            ],{
                stroke:"#94a3b8",
                selectable:false
            });

            canvas.add(line);
            connectorStart=null;
        }
        if(!connectorStart){
            connectorStart=obj;
        }else{
            const arrow = new fabric.Triangle({
                left:pointer.x,
                top:pointer.y,
                angle:90,
                width:12,
                height:12,
                fill:"#fff"
            });
                canvas.add(arrow);
        }

    });

    // ==========================
    // MOUSE DOWN
    // ==========================
    canvas.on("mouse:down", opt => {

      const pointer = canvas.getPointer(opt.e);
      startX = pointer.x;
      startY = pointer.y;

      if (tool === "rect") {
        drawingObject = new fabric.Rect({
          left:startX,
          top:startY,
          width:0,
          height:0,
          fill:"rgba(59,130,246,0.2)",
          stroke:"#3b82f6",
          strokeWidth:2
        });
        canvas.add(drawingObject);
      }

      if (tool === "circle") {
        drawingObject = new fabric.Ellipse({
          left:startX,
          top:startY,
          rx:1,
          ry:1,
          fill:"rgba(34,197,94,0.2)",
          stroke:"#22c55e"
        });
        canvas.add(drawingObject);
      }

      // FLOWCHART DIAMOND
      if (tool === "diamond") {
        drawingObject = new fabric.Polygon([
          {x:0,y:50},
          {x:50,y:0},
          {x:100,y:50},
          {x:50,y:100}
        ],{
          left:startX,
          top:startY,
          fill:"rgba(250,204,21,0.2)",
          stroke:"#facc15"
        });
        canvas.add(drawingObject);
      }

      // STRAIGHT LINE
      if (tool === "line" || tool==="arrow") {
        drawingObject = new fabric.Line(
          [startX,startY,startX,startY],
          { stroke:"#fff", strokeWidth:2 }
        );
        canvas.add(drawingObject);
      }

      // TEXT
      if (tool === "text") {
        const text = new fabric.IText("Text",{
          left:startX,
          top:startY,
          fill:"#fff"
        });
        canvas.add(text);
      }
    });

    // ==========================
    // MOUSE MOVE (DRAW)
    // ==========================
    canvas.on("mouse:move", opt => {
      if(!drawingObject) return;

      const pointer = canvas.getPointer(opt.e);

      if (drawingObject.type==="rect") {
        drawingObject.set({
          width: pointer.x-startX,
          height:pointer.y-startY
        });
      }

      if (drawingObject.type==="ellipse") {
        drawingObject.set({
          rx: Math.abs(pointer.x-startX)/2,
          ry: Math.abs(pointer.y-startY)/2
        });
      }

      if (drawingObject.type==="line") {
        drawingObject.set({
          x2:pointer.x,
          y2:pointer.y
        });
      }

      canvas.renderAll();
    });

    canvas.on("mouse:up",()=>{
      drawingObject=null;
    });

    // ==========================
    // PEN TOOL (PAINTING)
    // ==========================
    canvas.isDrawingMode = tool === "pen";

    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "#ffffff";

    // zoom
    canvas.on("mouse:wheel", e => {
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** e.e.deltaY;
      canvas.zoomToPoint(
        { x: e.e.offsetX, y: e.e.offsetY },
        zoom
      );
      setZoom(zoom);
      e.e.preventDefault();
    });

    ref.current = canvas;
    return () => canvas.dispose();
  }, []);

  return <canvas id="fabric" width={3000} height={2000} />;
}
