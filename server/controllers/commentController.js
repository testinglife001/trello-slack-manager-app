// controllers/commentController.js
const mongoose = require("mongoose");
const Card = require("../models/Card");
const Channel = require("../models/Channel");
const Comment = require("../models/Comment");
const { extractMentions } = require("../utils/mentionParser");
const { notifyMention } = require("../services/notificationService");




exports.create=async(req,res)=>{

 const {extractMentions}=require("../utils/mentionParser");
 const {notifyMention}=require("../services/notificationService");

 const mentions=await extractMentions(req.body.content);

 const c=await Comment.create({
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


exports.byCard = async (req, res) => {
  const list = await Comment.find({ card: req.params.cardId })
    .populate("author", "name avatar")
    .sort("-createdAt");

  res.json(list);
};

exports.resolve=async(req,res)=>{
 const root=await Comment.findByIdAndUpdate(
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


