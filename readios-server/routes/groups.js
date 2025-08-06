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
  searchGroupsWithPostsToday
  getTodaysGroupPostsSummary,
  shareDailySummaryToFacebook
} = require('../controllers/groupController');

router.get('/searchWithPostsToday', searchGroupsWithPostsToday);
router.get('/search', searchGroups);

router.get('/:id', getGroupById);
router.post('/:groupId/members/:userId', addGroupMember);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id/members/:memberId', removeMember);
router.delete('/:id', deleteGroup);
router.get('/today/:groupId', getTodaysGroupPostsSummary);
router.post('/:groupId/share-to-facebook', shareDailySummaryToFacebook);

module.exports = router;
