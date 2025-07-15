const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// יצירת פוסט
router.post('/', postController.createPost);

// מחיקת פוסט
router.delete('/:id', postController.deletePost);

// הוספת תגובה
router.post('/:id/comments', postController.addComment);

// לייק/אנלייק
router.put('/:id/like', postController.toggleLike);

// עדכון תמונה
router.put('/:id/image', postController.updateImage);

// חיפוש
router.get('/', postController.searchPosts);

module.exports = router;
