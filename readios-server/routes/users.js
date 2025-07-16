const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById, updateUserDetails, deleteUser, addFriend, removeFriend } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserDetails);
router.delete('/:id', deleteUser);

router.post('/:id/friend/:friendId', addFriend);
router.delete('/:id/friend/:friendId', removeFriend);

module.exports = router;
