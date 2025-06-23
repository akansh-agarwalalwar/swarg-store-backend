const PostedID = require('../models/PostedID');
const path = require('path');

exports.create = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required.' });
    }
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Build media array from uploaded files (image and video)
    let media = [];
    if (req.files) {
      if (req.files.image) {
        req.files.image.forEach(file => {
          media.push({
            type: 'image',
            url: `/uploads/${file.filename}`
          });
        });
      }
      if (req.files.video) {
        req.files.video.forEach(file => {
          media.push({
            type: 'video',
            url: `/uploads/${file.filename}`
          });
        });
      }
    }
    if (media.length === 0) {
      return res.status(400).json({ message: 'At least one media file (image or video) is required.' });
    }

    const postedID = new PostedID({
      title,
      price,
      description,
      media,
      postedBy: req.user.id,
      role: req.user.role === 'admin' ? 'Admin' : 'SubAdmin',
    });
    await postedID.save();
    res.status(201).json({ message: 'ID posted successfully', postedID });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const ids = await PostedID.find().sort({ createdAt: -1 });
    res.json(ids);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = await PostedID.findById(req.params.id);
    if (!id) return res.status(404).json({ message: 'ID not found' });
    res.json(id);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/ids/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required.' });
    const id = await PostedID.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!id) return res.status(404).json({ message: 'ID not found' });
    res.json({ message: 'Status updated', id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/ids/:id
exports.updateID = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    let updateData = {};
    if (title) updateData.title = title;
    if (price) updateData.price = price;
    if (description) updateData.description = description;
    // Handle new media uploads
    let media = [];
    if (req.files) {
      if (req.files.image) {
        req.files.image.forEach(file => {
          media.push({
            type: 'image',
            url: `/uploads/${file.filename}`
          });
        });
      }
      if (req.files.video) {
        req.files.video.forEach(file => {
          media.push({
            type: 'video',
            url: `/uploads/${file.filename}`
          });
        });
      }
    }
    if (media.length > 0) {
      updateData.$push = { media: { $each: media } };
    }
    const id = await PostedID.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!id) return res.status(404).json({ message: 'ID not found' });
    res.json({ message: 'ID updated', id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};