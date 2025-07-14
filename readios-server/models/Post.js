const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const postSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  type:     { type: String, enum: ['text', 'image', 'video', 'image+text', 'video+text'], required: true },
  url:      { type: String }, // Optional URL for image or video
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
