const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { fetchUserById } = require('../utils');
const Group = require('../models/Group');

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, location, profileImage } = req.body;

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      location,
      profileImage
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const { password: _, ...userData } = user.toObject();

    res.status(201).json({ message: 'User registered', token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ message: 'Login successful', token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const user = await fetchUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


exports.updateUserDetails = async (req, res) => {
  try {
    const { email, location, profileImage } = req.body;

    // User can update only email, location and profileImage
    const allowedUpdates = {};
    if (email !== undefined) allowedUpdates.email = email;
    if (location !== undefined) allowedUpdates.location = location;
    if (profileImage !== undefined) allowedUpdates.profileImage = profileImage;

    await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { runValidators: true }
    );

    const updatedUser = await fetchUserById(req.params.id);
    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


// Todo: remove from friends, groups, posts etc...
exports.deleteUser = async (req, res) => {
  try {
    const user = await fetchUserById(req.params.id)
    await User.deleteOne(user);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed', error: err.message });
  }
};


exports.addFriend = async (req, res) => {
  try {
    const { id: userId, friendId } = req.params;

    if (userId === friendId) {
      return res.status(400).json({ message: "You can't add yourself as a friend" });
    }

    const user = await fetchUserById(userId);
    const friend = await fetchUserById(friendId);

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'You already friends' });
    }

    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Add friend failed', error: err.message });
  }
};


exports.removeFriend = async (req, res) => {
  try {
    const { id: userId, friendId } = req.params;
    const user = await fetchUserById(userId);
    const friend = await fetchUserById(friendId);

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Users are not friends' });
    }

    user.friends = user.friends.filter(f => f.toString() !== friendId);
    friend.friends = friend.friends.filter(f => f.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Remove friend failed', error: err.message });
  }
};

exports.searchUsersContainsName = async (req, res) => {
  try {
    const { search, location, groupId } = req.query;

    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.username = { $regex: regex };
    }

    if (location) {
      query.location = location;
    }

    if (groupId) {
      query.groups = groupId;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};


exports.GetUserFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends', 'username profileImage');

    const friends = user.friends.map(f => ({
      _id: f._id,
      username: f.username,
      profileImage: f.profileImage
    }));

    res.json({ friends });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch friends', error: err.message });
  }
};


exports.getUserGroupPreviews = async (req, res) => {
  try {
    const userId = req.params.id;

    const groups = await Group.find({ 'members.user': userId })
      .select('name _id')
      .lean();

    const groupPreviews = groups.map(group => ({
      _id: group._id,
      name: group.name,
      image: group.image || null
    }));

    res.json({ groups: groupPreviews });
  } catch (err) {
    console.error("Error fetching group previews:", err);
    res.status(500).json({ message: "שגיאה בקבלת קבוצות" });
  }
};