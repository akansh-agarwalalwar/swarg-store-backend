const TelegramLink = require('../models/TelegramLink');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');

// Add a new Telegram link
exports.addLink = async (req, res) => {
  try {
    const { link } = req.body;
    let addedBy, addedByRole;
    if (req.user.role === 'admin') {
      const admin = await Admin.findOne({ username: req.user.username });
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      addedBy = admin._id;
      addedByRole = 'Admin';
    } else if (req.user.role === 'subadmin') {
      const subadmin = await SubAdmin.findOne({ username: req.user.username });
      if (!subadmin) return res.status(404).json({ error: 'SubAdmin not found' });
      addedBy = subadmin._id;
      addedByRole = 'SubAdmin';
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const telegramLink = new TelegramLink({ link, addedBy, addedByRole });
    await telegramLink.save();
    res.status(201).json(telegramLink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Telegram links
exports.getLinks = async (req, res) => {
  try {
    const links = await TelegramLink.find({});
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a Telegram link
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { link } = req.body;
    const updated = await TelegramLink.findByIdAndUpdate(id, { link }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Telegram link not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Telegram link
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TelegramLink.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Telegram link not found' });
    res.json({ message: 'Telegram link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};