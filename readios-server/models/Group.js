const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isAdmin: { type: Boolean, default: false }
    }
  ],
  createdAt: { type: Date, default: () => new Date(Date.now() + 3 * 60 * 60 * 1000)}
});

module.exports = mongoose.model('Group', groupSchema);


