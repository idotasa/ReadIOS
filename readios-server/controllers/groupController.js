const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = new Group({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id]
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

// Get group by ID
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'username');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

// Add members to group
const addGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const newMembers = req.body.members; // Array of user IDs
    newMembers.forEach(id => {
      if (!group.members.includes(id)) {
        group.members.push(id);
      }
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add members' });
  }
};

// Search groups by name
const searchGroups = async (req, res) => {
  try {
    const { search } = req.query;
    const groups = await Group.find({
      name: { $regex: search, $options: 'i' }
    });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search groups', details: err.message });

  }
};

// Update group (owner only)
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the group owner can update the group' });
    }

    const { name, description } = req.body;
    if (name) group.name = name;
    if (description) group.description = description;

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group' });
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
    group.members = group.members.filter(id => id.toString() !== memberId);

    await group.save();
    res.json({ message: 'Member removed', group });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

module.exports = {
  createGroup,
  getGroupById,
  addGroupMembers,
  searchGroups,
  updateGroup,
  removeMember
};
