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
  searchGroupsWithPostsToday,
  getTodaysGroupPostsSummary,
  shareDailySummaryToFacebook,
  getPostCountsByGroupToday,
  getGroupStats
} = require('../controllers/groupController');

router.get('/searchWithPostsToday', searchGroupsWithPostsToday);
router.get('/stats/postsByGroupToday', getPostCountsByGroupToday);
router.get('/stats', getGroupStats);
router.get('/today/:groupId', getTodaysGroupPostsSummary);
router.post('/:groupId/share-to-facebook', shareDailySummaryToFacebook);
router.post('/', createGroup); // Create a new group
router.post('/:groupId/members/:userId', addGroupMember);
router.get('/', searchGroups); // Search groups by name
router.delete('/:id/members/:memberId', removeMember); // Remove member (owner only)
router.put('/:id', updateGroup); // Update group (owner only)
router.delete('/:id', deleteGroup);
router.get('/:id', getGroupById); // Get group details

module.exports = router;

