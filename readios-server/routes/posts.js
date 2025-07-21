const express = require('express');
const router = express.Router();
const { createPost, deletePost, addComment, toggleLike, getPostById, searchPosts } = require('../controllers/postController');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, createPost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/comments', verifyToken, addComment);
router.put('/:id/like', verifyToken, toggleLike);
router.get('/:id', verifyToken, getPostById);
router.get('/', verifyToken, searchPosts);

module.exports = router;
