const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const authController = require('../controllers/authController');
const jwt_secret = require('../middlewares/authenticateToken')






router.post('/register', authController.register);

router.post('/login', authController.login);


module.exports = router;