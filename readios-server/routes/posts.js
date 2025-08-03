const express = require('express');
const router = express.Router();
const { createPost, deletePost, addComment, toggleLike, getPostById, searchPosts, getFeedForUser } = require('../controllers/postController');

router.post('/', createPost);
router.delete('/:id', deletePost);
router.post('/:id/comments', addComment);
router.put('/:id/like', toggleLike);
router.get('/:id', getPostById);
router.get('/', searchPosts);
router.get('/feed/:userId', getFeedForUser);

module.exports = router;
