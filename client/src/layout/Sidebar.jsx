// layout/Sidebar.jsx
import {useEffect} from "react";
import {useChannel} from "../context/ChannelContext";
import {getChannelsByProject} from "../api/channelApi";
import ChannelList from "./ChannelList";

export default function Sidebar(){

 const {setChannels}=useChannel();

 useEffect(()=>{
   // demo project id
   getChannelsByProject("PROJECT_ID")
     .then(res=>setChannels(res.data));
 },[]);

 return(
  <div className="sidebar">
    <h3>Channels</h3>
    <ChannelList/>
  </div>
 );
}
