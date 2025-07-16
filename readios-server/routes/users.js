const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById, updateUserDetails, deleteUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserDetails);
router.delete('/:id', deleteUser);

module.exports = router;
