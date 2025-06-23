const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
});

const postedIDSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  media: [mediaSchema],
  postedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'role', required: true },
  role: { type: String, enum: ['Admin', 'SubAdmin'], required: true },
  status :{
    type: String,
    enum : ["available", "sold out"],
    default : "available"
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PostedID', postedIDSchema); 