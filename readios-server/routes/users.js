const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById, updateUserDetails, deleteUser, addFriend, removeFriend, searchUsersContainsName } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', verifyToken, searchUsersContainsName);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUserDetails);
router.delete('/:id', verifyToken, deleteUser);

router.post('/:id/friend/:friendId', verifyToken, addFriend);
router.delete('/:id/friend/:friendId', verifyToken, removeFriend);

module.exports = router;
