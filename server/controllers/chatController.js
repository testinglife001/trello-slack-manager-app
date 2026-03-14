// 📁 controllers/chatController.js
// ✔ LOAD HISTORY + UNREAD MARK
const ChannelRead=require("../models/ChannelRead");
const Message=require("../models/Message");

exports.history=async(req,res)=>{

 const user=req.user._id;
 const channel=req.params.id;

 const cursor=await ChannelRead.findOne({user,channel});

 const msgs=await Message.find({channel})
 .sort("createdAt")
 .limit(50)
 .populate("sender","name avatar");

 res.json({
   messages:msgs,
   lastReadAt:cursor?.lastReadAt
 });

};


exports.markRead=async(req,res)=>{

 const user=req.user._id;
 const {channel}=req.body;

 await ChannelRead.findOneAndUpdate(
   {user,channel},
   {lastReadAt:new Date()},
   {upsert:true}
 );

 res.json({ok:true});
};

exports.edit=async(req,res)=>{
 const msg=await Message.findByIdAndUpdate(
   req.params.id,
   {content:req.body.content,editedAt:new Date()},
   {new:true}
 );
 res.json(msg);
};

exports.delete=async(req,res)=>{
 const msg=await Message.findByIdAndUpdate(
   req.params.id,
   {deletedAt:new Date()},
   {new:true}
 );
 res.json(msg);
};
