// canvas/useFabricEngine.js


import {useEffect,useRef} from "react";
import {fabric} from "fabric";
import {useCanvas} from "../context/CanvasContext";

export default function useFabricEngine(id){

 const canvasRef=useRef();
 const {fabricJSON,pushHistory}=useCanvas();

 useEffect(()=>{

   const canvas=new fabric.Canvas(id,{
     preserveObjectStacking:true,
     selection:true
   });

   canvasRef.current=canvas;

   // restore
   if(fabricJSON){
     canvas.loadFromJSON(fabricJSON,()=>canvas.renderAll());
   }

   // history tracking
   canvas.on("object:modified",()=>{
      pushHistory(canvas.toJSON());
   });

   canvas.on("object:added",()=>{
      pushHistory(canvas.toJSON());
   });

   return ()=>canvas.dispose();

 },[fabricJSON]);

 return canvasRef;
}
