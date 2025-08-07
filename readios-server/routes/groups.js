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
  shareDailySummaryToFacebook,
  getGroupStats
} = require('../controllers/groupController');

router.get('/stats', getGroupStats);
router.post('/', createGroup); // Create a new group
router.post('/:groupId/members/:userId', addGroupMember);
router.get('/', searchGroups); // Search groups by name
router.delete('/:id/members/:memberId', removeMember); // Remove member (owner only)

router.get('/today/:groupId', getTodaysGroupPostsSummary);
router.post('/:groupId/share-to-facebook', shareDailySummaryToFacebook);
router.put('/:id', updateGroup); // Update group (owner only)
router.get('/:id', getGroupById); // Get group details
router.delete('/:id', deleteGroup);
module.exports = router;

