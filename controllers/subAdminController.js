const SubAdmin = require('../models/SubAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const existing = await SubAdmin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const subadmin = new SubAdmin({ username, password: hashedPassword });
    await subadmin.save();
    res.status(201).json({ message: 'Subadmin registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const subadmin = await SubAdmin.findOne({ username });
    if (!subadmin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, subadmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: subadmin._id, username: subadmin.username, role: 'subadmin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, role: 'subadmin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CRUD operations (admin only)
exports.getAll = async (req, res) => {
  try {
    const subadmins = await SubAdmin.find();
    res.json(subadmins);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const subadmin = await SubAdmin.findById(req.params.id);
    if (!subadmin) return res.status(404).json({ message: 'Subadmin not found' });
    res.json(subadmin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { username, password } = req.body;
    const updateData = { username };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const subadmin = await SubAdmin.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!subadmin) return res.status(404).json({ message: 'Subadmin not found' });
    res.json({ message: 'Subadmin updated', subadmin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const subadmin = await SubAdmin.findByIdAndDelete(req.params.id);
    if (!subadmin) return res.status(404).json({ message: 'Subadmin not found' });
    res.json({ message: 'Subadmin deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};