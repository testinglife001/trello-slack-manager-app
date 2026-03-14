// 📁 models/ChannelRead.js
const mongoose=require("mongoose");

const schema=new mongoose.Schema({

  user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  channel:{type:mongoose.Schema.Types.ObjectId,ref:"Channel"},

  lastReadAt:{type:Date,default:new Date(0)}

});

schema.index({user:1,channel:1},{unique:true});

module.exports=mongoose.model("ChannelRead",schema);
