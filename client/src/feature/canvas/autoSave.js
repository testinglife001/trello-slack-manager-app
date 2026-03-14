import debounce from "lodash.debounce";
import axios from "../api/axios";

export default debounce((id,data)=>{
 axios.put(`/canvas/${id}`,{
   content:data
 });
},1500);