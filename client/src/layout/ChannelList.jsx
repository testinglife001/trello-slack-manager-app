// layout/ChannelList.jsx

import {useChannel} from "../context/ChannelContext";

export default function ChannelList(){

 const {channels,setActiveChannel,activeChannel}=useChannel();

 return(
  <>
   {channels.map(ch=>(
     <div
       key={ch._id}
       className={activeChannel===ch._id?"channel active":"channel"}
       onClick={()=>setActiveChannel(ch._id)}
     >
       # {ch.name}
     </div>
   ))}
  </>
 );
}
