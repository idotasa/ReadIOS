const Group = require('../models/Group');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = decoded.id;

    const group = new Group({
      name,
      description,
      owner: userId,
      members: [{ user: userId, isAdmin: true }] // ✅ תיקון כאן
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

// Get group by ID
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.user', 'username');
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const membersWithDetails = group.members
      .filter(m => m.user && m.user.username)
      .map(m => ({
        _id: m.user._id,
        username: m.user.username,
        isAdmin: m.isAdmin
      }));

    res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      owner: group.owner,
      createdAt: group.createdAt,
      members: membersWithDetails
    });
  } catch (err) {
    console.error('❌ Error in getGroupById:', err.message);
    res.status(500).json({ error: 'Failed to fetch group', details: err.message });
  }
};

// Add members to group
const addGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const newMembers = req.body.members; // Array of user IDs

    newMembers.forEach(id => {
      const alreadyInGroup = group.members.some(m => m.user.toString() === id);
      if (!alreadyInGroup) {
        group.members.push({ user: id, isAdmin: false });
      }
    });

    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add members', details: err.message });
  }
};


// Search groups
const searchGroups = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : null;

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {}; // אם אין search - מחזיר הכל

    const groups = await Group.find(query);
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search groups', details: err.message });
  }
};


// Update group (owner only)
const updateGroup = async (req, res) => {
  try {
    const userId = decoded.id;

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only the group owner can update the group' });
    }

    const { name, description } = req.body;
    if (name) group.name = name;
    if (description) group.description = description;

    await group.save();
    res.json(group);
  } catch (err) {
    console.error('❌ Error updating group:', err.message); 
    res.status(500).json({ error: 'Failed to update group', details: err.message });
  }
};

// Remove member from group (owner only)
const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the group owner can remove members' });
    }

    const memberId = req.params.memberId;

    // סינון על פי m.user
    group.members = group.members.filter(
      m => m.user.toString() !== memberId
    );

    await group.save();
    res.json({ message: 'Member removed', group });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member', details: err.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const userId = decoded.id;

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only the group owner can delete the group' });
    }

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete group:', err.message);
    res.status(500).json({ error: 'Failed to delete group', details: err.message });
  }
};

module.exports = {
  createGroup,
  getGroupById,
  addGroupMembers,
  searchGroups,
  updateGroup,
  removeMember,
  deleteGroup
};
