const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById, updateUserDetails } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserDetails);

module.exports = router;
