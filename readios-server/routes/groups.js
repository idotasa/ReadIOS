const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroupById,
  addGroupMember,
  searchGroups,
  updateGroup,
  removeMember,
  deleteGroup,
  getTodaysGroupPostsSummary,
  shareDailySummaryToFacebook
} = require('../controllers/groupController');

router.post('/', createGroup); // Create a new group
router.get('/:id', getGroupById); // Get group details
router.post('/:groupId/members/:userId', addGroupMember);
router.get('/', searchGroups); // Search groups by name
router.put('/:id', updateGroup); // Update group (owner only)
router.delete('/:id/members/:memberId', removeMember); // Remove member (owner only)
router.delete('/:id', deleteGroup);
router.get('/today/:groupId', getTodaysGroupPostsSummary);
router.post('/:groupId/share-to-facebook', shareDailySummaryToFacebook);

module.exports = router;

