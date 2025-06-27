const mongoose = require('mongoose');

const telegramLinkSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'addedByRole'
  },
  addedByRole: {
    type: String,
    required: true,
    enum: ['Admin', 'SubAdmin']
  }
}, { timestamps: true });

// Ensure a user can only add one link
telegramLinkSchema.index({ addedBy: 1, addedByRole: 1 }, { unique: true });

module.exports = mongoose.model('TelegramLink', telegramLinkSchema);
