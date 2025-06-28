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
    const links = await TelegramLink.find({})
      .populate('addedBy', 'username')
      .lean();
    
    // Transform the data to include username
    const transformedLinks = links.map(link => ({
      ...link,
      addedBy: {
        username: link.addedBy?.username || 'Unknown',
        role: link.addedByRole
      }
    }));
    
    res.json(transformedLinks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get subadmin's own telegram link
exports.getSubAdminLink = async (req, res) => {
  try {
    if (req.user.role !== 'subadmin') {
      return res.status(401).json({ error: 'Only subadmins can access this endpoint' });
    }

    const subadmin = await SubAdmin.findOne({ username: req.user.username });
    if (!subadmin) {
      return res.status(404).json({ error: 'SubAdmin not found' });
    }

    const telegramLink = await TelegramLink.findOne({
      addedBy: subadmin._id,
      addedByRole: 'SubAdmin'
    });

    if (!telegramLink) {
      return res.status(404).json({ error: 'Telegram link not found for this subadmin' });
    }

    res.json(telegramLink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create or update subadmin's telegram link
exports.createOrUpdateSubAdminLink = async (req, res) => {
  try {
    if (req.user.role !== 'subadmin') {
      return res.status(401).json({ error: 'Only subadmins can access this endpoint' });
    }

    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ error: 'Telegram link is required' });
    }

    const subadmin = await SubAdmin.findOne({ username: req.user.username });
    if (!subadmin) {
      return res.status(404).json({ error: 'SubAdmin not found' });
    }

    // Check if telegram link already exists for this subadmin
    let telegramLink = await TelegramLink.findOne({
      addedBy: subadmin._id,
      addedByRole: 'SubAdmin'
    });

    if (telegramLink) {
      // Update existing link
      telegramLink.link = link;
      await telegramLink.save();
      res.json({ message: 'Telegram link updated successfully', telegramLink });
    } else {
      // Create new link
      telegramLink = new TelegramLink({
        link,
        addedBy: subadmin._id,
        addedByRole: 'SubAdmin'
      });
      await telegramLink.save();
      res.status(201).json({ message: 'Telegram link created successfully', telegramLink });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete subadmin's telegram link
exports.deleteSubAdminLink = async (req, res) => {
  try {
    if (req.user.role !== 'subadmin') {
      return res.status(401).json({ error: 'Only subadmins can access this endpoint' });
    }

    const subadmin = await SubAdmin.findOne({ username: req.user.username });
    if (!subadmin) {
      return res.status(404).json({ error: 'SubAdmin not found' });
    }

    const telegramLink = await TelegramLink.findOneAndDelete({
      addedBy: subadmin._id,
      addedByRole: 'SubAdmin'
    });

    if (!telegramLink) {
      return res.status(404).json({ error: 'Telegram link not found for this subadmin' });
    }

    res.json({ message: 'Telegram link deleted successfully' });
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