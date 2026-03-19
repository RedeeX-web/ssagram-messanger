const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['private', 'group'], 
    required: true 
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  // Поля ниже заполняются только если type === 'group'
  groupInfo: {
    name: { type: String },
    username: { type: String }, // Формат @name
    avatarUrl: { type: String, default: 'https://png.klev.club/uploads/posts/2024-05/png-klev-club-mxbp-p-ikonka-akkaunt-png-3.png' }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastMessage: {
    text: String,
    senderName: String,
    at: { type: Date, default: Date.now }
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);