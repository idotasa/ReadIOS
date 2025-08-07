const express = require('express');
const router = express.Router();
const {
  createPost,
  deletePost,
  addComment,
  toggleLike,
  getPostById,
  searchPosts,
  getFeedForUser,
  getFeedForGroup,
  getPostCountsByType
} = require('../controllers/postController');

router.post('/', createPost);
router.get('/stats/byType', getPostCountsByType); 
router.get('/feed/:userId', getFeedForUser);
router.get('/feed/groups/:groupId', getFeedForGroup);
router.get('/', searchPosts);
router.delete('/:id', deletePost);
router.post('/:id/comments', addComment);
router.put('/:id/like', toggleLike);
router.get('/:id', getPostById); 

module.exports = router;
