const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const fetchUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  return user || null;
};


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
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
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
      { new: true, runValidators: true }
    );

    const updatedUser = await fetchUserById(req.params.id);
    res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};