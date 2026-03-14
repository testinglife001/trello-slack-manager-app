// controllers/threadController.js
const Thread = require("../models/Thread");
const Message = require("../models/Message");


// ============================
// GET THREAD REPLIES
// ============================
exports.history = async (req,res)=>{
    const list = await Thread.find({
        parentMessage:req.params.id
    })
    .populate("sender","name avatar")
    .sort("createdAt");

    res.json(list);
};


// ============================
// CREATE REPLY
// ============================
exports.create = async (req,res)=>{

    const reply = await Thread.create({
        ...req.body,
        sender:req.user._id
    });

    await Message.findByIdAndUpdate(
        req.body.parentMessage,
        { $inc:{threadCount:1} }
    );

    res.json(reply);
};

exports.byMessage = async (req,res)=>{
 const list = await Thread.find({
   parentMessage:req.params.id
 })
 .populate("sender","name avatar")
 .sort("createdAt");

 res.json(list);
};

exports.resolve=async(req,res)=>{

 const reply=await Thread.findByIdAndUpdate(
   req.params.id,
   {resolved:true},
   {new:true}
 );

 res.json(reply);
};

