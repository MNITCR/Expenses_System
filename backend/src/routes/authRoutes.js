const express = require('express');
const router = express.Router();
const { register, login, getUser, editUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/:id', getUser);
router.put('/:id', editUser);

module.exports = router;
