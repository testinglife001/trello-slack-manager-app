// 📁 models/CanvasComment.js
const mongoose=require("mongoose");

const schema=new mongoose.Schema({

 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project"},
 channel:{type:mongoose.Schema.Types.ObjectId,index:true},

 nodeId:String,

 parent:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"CanvasComment",
  default:null
 },

 content:String,

 mentions:[
  {type:mongoose.Schema.Types.ObjectId,ref:"User"}
 ],

 resolved:{type:Boolean,default:false},

 pinned:{
  x:Number,
  y:Number
 },

 author:{type:mongoose.Schema.Types.ObjectId,ref:"User"}

},{timestamps:true});

module.exports=mongoose.model("CanvasComment",schema);
