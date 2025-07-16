const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroupById,
  addGroupMembers,
  searchGroups,
  updateGroup,
  removeMember
} = require('../controllers/groupController');

router.post('/', createGroup); // Create a new group
router.get('/:id', getGroupById); // Get group details
router.post('/:id/members', addGroupMembers); // Add members to a group
router.get('/', searchGroups); // Search groups by name
router.put('/:id', updateGroup); // Update group (owner only)
router.delete('/:id/members/:memberId', removeMember); // Remove member (owner only)

module.exports = router;
