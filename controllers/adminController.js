
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/emailTemplates');


const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email ) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword , email});
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(username, password)
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: admin._id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, role: 'admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Request OTP for password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    admin.otp = otp;
    admin.otpExpiry = otpExpiry;
    await admin.save();
    await sendOtpEmail({ to: email, username: admin.username, otp });
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
    const admin = await Admin.findOne({ email });
    if (!admin || admin.otp !== otp || !admin.otpExpiry || admin.otpExpiry < new Date()) {
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
    const admin = await Admin.findOne({ email });
    if (!admin || admin.otp !== otp || !admin.otpExpiry || admin.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};