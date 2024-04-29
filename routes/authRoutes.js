const express = require('express');
const { login, logout, register } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router