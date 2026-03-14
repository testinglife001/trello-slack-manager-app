// server/controllers/attachmentController.js
const Attachment = require("../models/Attachment");
const Card = require("../models/Card");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// UPLOAD
exports.upload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file" });

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "kanban_attachments"
    });

    const attachment = await Attachment.create({
      project: req.body.project,
      linkedCard: req.body.card,

      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,

      localPath: file.path,

      cloudUrl: result.secure_url,
      cloudPublicId: result.public_id,

      uploadedBy: req.user._id
    });

    // increment counter
    await Card.findByIdAndUpdate(req.body.card, {
      $inc: { attachmentsCount: 1 }
    });

    req.io?.to(req.body.project).emit("attachment:added", attachment);
    res.json(attachment);
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};


// GET BY CARD
exports.byCard = async (req, res) => {
  const files = await Attachment.find({
    linkedCard: req.params.cardId
  }).sort("-createdAt");

  res.json(files);
};


// DELETE
exports.remove = async (req, res) => {
  try {
    const file = await Attachment.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "Not found" });

    if (!file.uploadedBy.equals(req.user._id))
      return res.status(403).json({ message: "Not allowed" });

    // remove from cloud
    await cloudinary.uploader.destroy(file.cloudPublicId);

    // remove local
    if (fs.existsSync(file.localPath)) fs.unlinkSync(file.localPath);

    await Card.findByIdAndUpdate(file.linkedCard, {
      $inc: { attachmentsCount: -1 }
    });

    await file.deleteOne();

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

