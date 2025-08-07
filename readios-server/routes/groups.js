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
router.post('/', createGroup);
router.post('/:groupId/members/:userId', addGroupMember);
router.get('/', searchGroups);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id', updateGroup);
router.delete('/:groupId/owner/:userId', deleteGroup);
router.get('/:id', getGroupById);

module.exports = router;

