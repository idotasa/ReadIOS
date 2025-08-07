const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  location: { type: String, required: true },
  profileImage: { type: String, required: true},
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
