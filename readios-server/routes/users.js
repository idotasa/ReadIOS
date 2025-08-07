const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById, updateUserDetails, deleteUser, addFriend, removeFriend, 
    searchUsersContainsName, GetUserFriends, getUserGroupPreviews } = require('../controllers/userController');

router.get('/:id/groupPreviews', getUserGroupPreviews);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', searchUsersContainsName);
router.get('/:id', getUserById);
router.put('/:id', updateUserDetails);
router.delete('/:id', deleteUser);

router.post('/:id/friend/:friendId', addFriend);
router.get('/:id/friends', GetUserFriends);
router.delete('/:id/friend/:friendId', removeFriend);


module.exports = router;

