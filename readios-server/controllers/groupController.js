const Group = require('../models/Group');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const userId = decoded.id;

    const group = new Group({
      name,
      description,
      owner: userId,
      members: [{ user: userId, isAdmin: true }]
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

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


const addGroupMember = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    group.members = group.members.filter(m => m.user);

    const alreadyInGroup = group.members.some(m => m.user?.toString() === userId);
    if (alreadyInGroup) {
      return res.status(400).json({ error: 'User is already in the group' });
    }

    group.members.push({ user: userId, isAdmin: false });
    await group.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });

    res.status(200).json({ message: 'User added to group', group });
  } catch (err) {
    console.error('❌ Failed to add member:', err.message);
    res.status(500).json({ error: 'Failed to add member', details: err.message });
  }
};



const searchGroups = async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : null;

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

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


const removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.memberId;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.owner.toString() === memberId) {
      return res.status(403).json({ error: 'Cannot remove the group owner' });
    }

    group.members = group.members.filter(m => m.user);

    const isMember = group.members.some(m => m.user?.toString() === memberId);
    if (!isMember) {
      return res.status(400).json({ error: 'User is not a member of the group' });
    }

    group.members = group.members.filter(m => m.user?.toString() !== memberId);
    await group.save();

    await User.findByIdAndUpdate(memberId, { $pull: { groups: groupId } });

    res.status(200).json({ message: 'Member removed successfully', group });
  } catch (err) {
    console.error('❌ Failed to remove member:', err.message);
    res.status(500).json({ error: 'Failed to remove member', details: err.message });
  }
};


const deleteGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (group.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only the group owner can delete the group' });
    }

    const memberIds = group.members.map(m => m.user.toString());

    await Promise.all(
      memberIds.map(async (id) => {
        try {
          await User.findByIdAndUpdate(id, { $pull: { groups: group._id } });
        } catch (err) {
          console.warn(`⚠️ Could not update user ${id}: ${err.message}`);
        }
      })
    );

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete group:', err.message);
    res.status(500).json({ error: 'Failed to delete group', details: err.message });
  }
};
const searchGroupsWithPostsToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const groupIdsWithPosts = await Post.distinct('groupId', {
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const groups = await Group.find({ _id: { $in: groupIdsWithPosts } });
    res.json(groups);
  } catch (err) {
    console.error('❌ Error in searchGroupsWithPostsToday:', err.message);
    res.status(500).json({ error: 'Failed to search groups with posts today', details: err.message });
  }
};



module.exports = {
  createGroup,
  getGroupById,
  addGroupMember,
  searchGroups,
  updateGroup,
  removeMember,
  deleteGroup,
  searchGroupsWithPostsToday
};
