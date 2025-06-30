const PostedID = require('../models/PostedID');
const TelegramLink = require('../models/TelegramLink');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');
const fs = require('fs');
const path = require('path');

exports.create = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    // console.log(title)
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
    // Fetch all posted IDs
    const ids = await PostedID.find().sort({ createdAt: -1 });
    // For each posted ID, fetch the telegram link and user data for the user who posted it
    const idsWithTelegram = await Promise.all(ids.map(async (id) => {
      const telegram = await TelegramLink.findOne({
        addedBy: id.postedBy,
        addedByRole: id.role
      });
      
      // Fetch user data based on role
      let userData = null;
      if (id.role === 'Admin') {
        userData = await Admin.findById(id.postedBy);
      } else if (id.role === 'SubAdmin') {
        userData = await SubAdmin.findById(id.postedBy);
      }
      
      return {
        ...id.toObject(),
        telegramLink: telegram ? telegram.link : null,
        postedBy: userData ? { username: userData.username, email: userData.email } : { username: 'Unknown', email: 'Unknown' }
      };
    }));
    res.json(idsWithTelegram);
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

exports.getMyPostedIDs = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // console.log('Logged user:', req.user);

    const ids = await PostedID.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    // or if necessary: 
    // const ids = await PostedID.find({ postedBy: mongoose.Types.ObjectId(req.user.id) }).sort({ createdAt: -1 });

    // console.log('Found posted IDs:', ids.length);
    res.json(ids);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteID = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PostedID.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'ID not found' });

    // Delete associated media files
    if (deleted.media && Array.isArray(deleted.media)) {
      deleted.media.forEach(media => {
        if (media.url && media.url.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', '..', media.url);
          fs.unlink(filePath, err => {
            if (err && err.code !== 'ENOENT') {
              console.error('Failed to delete file:', filePath, err.message);
            }
          });
        }
      });
    }

    res.json({ message: 'ID and associated media deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


