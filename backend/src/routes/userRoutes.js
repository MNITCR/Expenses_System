const express = require('express');
const verifyToken = require('../middlewares/authMiddlewares');
const authorizeRole = require('../middlewares/roleMiddlewares');
const router = express.Router();

// Only admin can access this route
router.get('/admin', verifyToken, authorizeRole('admin'),(req, res) => {
    res.json({message: "Welcome to Admin!"});
});

// Both admin and manager can access this route
router.get('/manager', verifyToken, authorizeRole('admin', 'manager'), (req, res) => {
    res.json({message: "Welcome to Manager!"});
});

// All can access this route
router.get('/user', verifyToken, authorizeRole('admin', 'manager', 'user'),(req, res) => {
    res.json({message: "Welcome to User!"});
});

module.exports = router;
