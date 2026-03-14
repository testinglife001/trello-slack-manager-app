// components/canvas/FabricBoard.jsx
import {useEffect,useRef, useState} from "react";
import {fabric} from "fabric";
import {useCanvas} from "../context/CanvasContext";
import { bindConnector } from "../../utils/connectors";
import { enableZoomPan } from "./ZoomPan";
import { Socket } from "socket.io-client";
import { saveAs } from "file-saver";
import { toSvg } from "html-to-image";



function routeConnector(from, to){

  const midX = (from.left + to.left)/2;

  return [
    "M", from.left, from.top,
    "L", midX, from.top,
    "L", midX, to.top,
    "L", to.left, to.top
  ];
}

export default function FabricBoard(){

 const canvasRef=useRef(null);
 const [canvasId,setCanvasId]= useState();
 const {fabricJSON}=useCanvas();

 const taskCard = new fabric.Group([
    new fabric.Rect({
        width:220,
        height:120,
        fill:"#fff",
        rx:10
    }),
    new fabric.Text("Task Title", {
        top:20,
        left:20
    })
 ]);



 useEffect(()=>{

    const canvas=new fabric.Canvas("board");
    canvasRef.current=canvas;

   
    canvas.selection = true;
    canvas.uniformScaling = true;
    // fabric.Object.prototype.cornerColor="#3b82f6";
    // fabric.Object.prototype.cornerSize=10;
    // bindConnector(line,nodeA,nodeB);
    // fabric.config.enableGLFiltering = true;
    // fabric.isWebglSupported();
    enableZoomPan(canvas);
    canvas.moveTo(object,index);
    canvas.add(taskCard);


   // RESTORE FROM DATABASE
   if(fabricJSON){
     canvas.loadFromJSON(fabricJSON,()=>{
       canvas.renderAll();
     });
   }

   canvas.on("object:modified", (e) => {
        Socket.emit("canvas-update", {
            canvasId,
            payload: e.target.toJSON()
        });
        Socket.on("remote-update", (obj) => {
        fabric.util.enlivenObjects([obj], ([object]) => {
            canvas.add(object);
            canvas.renderAll();
        });
        });
    });
    canvas.on("mouse:move", (opt) => {

        Socket.emit("cursor-move", {
            canvasId,
            cursor: {
            x: opt.pointer.x,
            y: opt.pointer.y
            }
        });
    });
    canvas.on("selection:created", e => {
        setSelectedObject(e.selected[0].objectId);
    });

   return ()=>canvas.dispose();

 },[fabricJSON]);

 useEffect(()=>{
    const key=e=>{
    if(e.ctrlKey && e.key==="z") undo();
    if(e.ctrlKey && e.key==="y") redo();
    };
    window.addEventListener("keydown",key);
    return ()=>window.removeEventListener("keydown",key);
  },[]);

  const exportPdf = () => {
    const data = canvas.toDataURL({ multiplier:2 });

    const pdf = new jsPDF();
    pdf.addImage(data,"PNG",0,0);
    pdf.save("canvas.pdf");
  }

  const exportSvg = () => {
    // const svg = canvas.toSVG();
    // download(svg);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    saveAs(blob, "canvas.svg");
    const node = document.getElementById("export-area");

    toSvg(node).then((dataUrl) => {
    const link = document.createElement("a");
    link.download = "image.svg";
    link.href = dataUrl;
    link.click();
    });
  }



 return <canvas id="board" width={3000} height={2000}/>;
}
