const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
});

module.exports = mongoose.model('Admin', adminSchema); 