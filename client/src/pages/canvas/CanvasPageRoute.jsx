// pages/CanvasPageRoute.jsx
import {useEffect} from "react";
import Sidebar from "../../layout/Sidebar";
// import FabricBoard from "../canvas/FabricBoard";
// import FloatingLayer from "../floating/FloatingLayer";


import {useChannel} from "../../context/ChannelContext";
import {useCanvas} from "../../context/CanvasContext";
import {loadCanvas} from "../../api/canvasApi";

import './CanvasPageRoute.css';
import FabricBoard from "../../component/canvas/FabricBoard";
import FloatingLayer from "../../component/canvas/FloatingLayer";

export default function CanvasPageRoute(){

 const {activeChannel}=useChannel();
 const {setFabricJSON,setNodes,setVersion}=useCanvas();

 // LOAD FROM MONGO
 useEffect(()=>{
   if(!activeChannel) return;

   loadCanvas(activeChannel).then(res=>{
     const doc=res.data;

     setFabricJSON(doc.content.fabric || null);
     setNodes(doc.content.nodes || []);
     setVersion(doc.version);
   });

 },[activeChannel]);

 return(
  <div className="app-layout">
    <Sidebar/>

    <div className="workspace">
        <FabricBoard/>
        <FloatingLayer/>
    </div>
  </div>
 );
}

