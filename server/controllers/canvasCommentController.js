// 📁 controllers/canvasCommentController.js
const CanvasComment = require("../models/CanvasComment");
const Channel = require("../models/Channel");
// const extract = require("../utils/extractMentions");
 const { extractMentions } = require("../utils/mentionParser");
const { notifyMention } = require("../services/notificationService");

// list
exports.list = async (req, res) => {
  const items = await CanvasComment.find({
    channel: req.params.channelId
  }).populate("author", "name avatar");

  res.json(items);
};

// create
exports.create=async(req,res)=>{

 const {extractMentions}=require("../utils/mentionParser");
 const {notifyMention}=require("../services/notificationService");

 const mentions=await extractMentions(req.body.content);

 const c=await CanvasComment.create({
  ...req.body,
  mentions,
  author:req.user._id
 });

 await notifyMention(
  mentions,
  req.user._id,
  "CanvasComment",
  c._id
 );

 const populated=await c.populate("author","name avatar");

 res.json(populated);
};

// RESOLVE THREAD
exports.resolve=async(req,res)=>{
 const root=await CanvasComment.findByIdAndUpdate(
  req.params.id,
  {resolved:true},
  {new:true}
 );
 res.json(root);
};


exports.byChannel = async (req,res)=>{
  const list = await CanvasComment.find({
    channel:req.params.channelId
  })
  .populate("author","name avatar")
  .sort("-createdAt");

  res.json(list);
};




exports.pin=async(req,res)=>{
 const pinned=await CanvasComment.findByIdAndUpdate(
  req.params.id,
  {pinned:req.body},
  {new:true}
 );
 res.json(pinned);
};



exports.byNode=async(req,res)=>{

 const list=await CanvasComment
 .find({
  channel:req.params.channelId,
  nodeId:req.params.nodeId
 })
 .populate("author","name avatar")
 .sort("createdAt");

 res.json(list);
};


