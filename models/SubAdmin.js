
const mongoose = require("mongoose");

const subAdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  // telegram: {
  //   type: String,
  // },
  otp: { type: String },
  otpExpiry: { type: Date },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
});

module.exports = mongoose.model("SubAdmin", subAdminSchema);
