const mongoose = require('mongoose');

const youTubeVideoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  // addedBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   refPath: 'addedByRole'
  // },
  addedByRole: {
    type: String,
    required: true,
    enum: ['Admin', 'SubAdmin']
  }
}, { timestamps: true });

module.exports = mongoose.model('YouTubeVideo', youTubeVideoSchema); 