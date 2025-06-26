const SubAdmin = require('../models/SubAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { sendSubAdminWelcomeEmail, sendOtpEmail } = require('../utils/emailTemplates');
const crypto = require('crypto');
const PostedID = require('../models/PostedID');
const SubAdminRent = require('../models/SubAdminRent');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Helper: Pause all PostedIDs by subadmin
async function pauseAllPostedIDsBySubAdmin(subadminId) {
  await PostedID.updateMany({ postedBy: subadminId, role: 'SubAdmin' }, { $set: { status: 'paused' } });
}

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log(username, password, email )
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required.' });
    }
    const existing = await SubAdmin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const subadmin = new SubAdmin({ username, password: hashedPassword, email });
    await subadmin.save();

    // Send welcome email
    try {
      await sendSubAdminWelcomeEmail({
        to: email,
        username,
        password
      });
    } catch (emailErr) {
      // Optionally log email error but don't block registration
      console.error('Failed to send welcome email:', emailErr);
    }

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
    const { username, password, status } = req.body;
    const updateData = { username };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (status) {
      updateData.status = status;
    }
    const subadmin = await SubAdmin.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!subadmin) return res.status(404).json({ message: 'Subadmin not found' });
    // If status is paused, pause all their PostedIDs
    if (status === 'paused') {
      await pauseAllPostedIDsBySubAdmin(subadmin._id);
    }
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

// Request OTP for password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const subadmin = await SubAdmin.findOne({ email });
    if (!subadmin) return res.status(404).json({ message: 'Subadmin not found.' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    subadmin.otp = otp;
    subadmin.otpExpiry = otpExpiry;
    await subadmin.save();
    await sendOtpEmail({ to: email, username: subadmin.username, otp });
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });
    const subadmin = await SubAdmin.findOne({ email });
    if (!subadmin || subadmin.otp !== otp || !subadmin.otpExpiry || subadmin.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    res.json({ message: 'OTP verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset password after OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required.' });
    const subadmin = await SubAdmin.findOne({ email });
    if (!subadmin || subadmin.otp !== otp || !subadmin.otpExpiry || subadmin.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    subadmin.password = await bcrypt.hash(newPassword, 10);
    subadmin.otp = undefined;
    subadmin.otpExpiry = undefined;
    await subadmin.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark rent as paid for a month
exports.subadminRentPay = async (req, res) => {
  try {
    const { subadminId, month, year, amount } = req.body;
    if (!subadminId || !month || !year || !amount) {
      return res.status(400).json({ message: 'subadminId, month, year, and amount are required.' });
    }
    let rent = await SubAdminRent.findOne({ subadmin: subadminId, month, year });
    if (!rent) {
      rent = new SubAdminRent({ subadmin: subadminId, month, year, amount, paid: true, paidAt: new Date() });
    } else {
      rent.paid = true;
      rent.amount = amount;
      rent.paidAt = new Date();
    }
    await rent.save();
    res.json({ message: 'Rent marked as paid.', rent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get rent payment status for a subadmin (optionally for a month/year)
exports.subadminRentStatus = async (req, res) => {
  try {
    const { subadminId, month, year } = req.query;
    if (!subadminId) return res.status(400).json({ message: 'subadminId is required.' });
    let query = { subadmin: subadminId };
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    const rents = await SubAdminRent.find(query).sort({ year: -1, month: -1 });
    res.json(rents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};